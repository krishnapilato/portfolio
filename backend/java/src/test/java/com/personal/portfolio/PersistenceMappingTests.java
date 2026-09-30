package com.personal.portfolio;

import static java.nio.charset.StandardCharsets.UTF_8;
import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.entry;
import static org.assertj.core.api.Assertions.tuple;

import com.personal.portfolio.auth.TokenPurpose;
import com.personal.portfolio.auth.UserToken;
import com.personal.portfolio.auth.UserTokenRepository;
import com.personal.portfolio.mail.Attachment;
import com.personal.portfolio.mail.Envelope;
import com.personal.portfolio.mail.MailMessage;
import com.personal.portfolio.mail.MailPayloads.AttachmentView;
import com.personal.portfolio.mail.MailPayloads.MailView;
import com.personal.portfolio.mail.MailRepository;
import com.personal.portfolio.mail.MailRepository.AttachmentMeta;
import com.personal.portfolio.mail.MailStatus;
import com.personal.portfolio.platform.Tally;
import com.personal.portfolio.user.AccountStatus;
import com.personal.portfolio.user.Role;
import com.personal.portfolio.user.User;
import com.personal.portfolio.user.UserPayloads.UserView;
import com.personal.portfolio.user.UserRepository;
import java.time.Duration;
import java.time.Instant;
import java.util.List;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.data.jpa.test.autoconfigure.DataJpaTest;
import org.springframework.boot.jdbc.test.autoconfigure.AutoConfigureTestDatabase;
import org.springframework.boot.jpa.test.autoconfigure.TestEntityManager;
import org.springframework.data.domain.Limit;
import org.springframework.data.domain.PageRequest;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.context.TestPropertySource;

@DataJpaTest(showSql = false)
@ActiveProfiles("test")
@AutoConfigureTestDatabase(replace = AutoConfigureTestDatabase.Replace.NONE)
@TestPropertySource(properties = "spring.datasource.url=jdbc:h2:mem:persistence;MODE=MySQL;DATABASE_TO_LOWER=TRUE;DB_CLOSE_DELAY=-1")
class PersistenceMappingTests {

    private static final Instant NOW = Instant.parse("2026-09-29T10:15:30.123456Z");
    private static final PageRequest FIRST_PAGE = PageRequest.of(0, 10);

    @Autowired
    private TestEntityManager entityManager;

    @Autowired
    private UserRepository users;

    @Autowired
    private UserTokenRepository tokens;

    @Autowired
    private MailRepository mails;

    @Test
    void persistsUsersAndAnswersTheirQueries() {
        var ada = users.save(User.register("  Ada Lovelace ", " Ada@Portfolio.Local ", "{bcrypt}ada", Role.ADMIN,
                AccountStatus.PENDING));
        users.save(User.register("Alan Turing", "alan@portfolio.local", "{bcrypt}alan", Role.USER, AccountStatus.ACTIVE));
        detach();

        var pending = users.findByEmail("ada@portfolio.local").orElseThrow();
        assertThat(UserView.of(pending)).satisfies(view -> {
            assertThat(view.id()).isEqualTo(ada.getId());
            assertThat(view.fullName()).isEqualTo("Ada Lovelace");
            assertThat(view.role()).isEqualTo(Role.ADMIN);
            assertThat(view.status()).isEqualTo(AccountStatus.PENDING);
            assertThat(view.lastLoginAt()).isNull();
            assertThat(view.createdAt()).isNotNull();
            assertThat(view.updatedAt()).isNotNull();
        });

        pending.verifyEmail();
        pending.recordSuccessfulLogin(NOW);
        detach();

        var active = users.findById(ada.getId()).orElseThrow();
        assertThat(active.getVersion()).isEqualTo(1);
        assertThat(active.getStatus()).isEqualTo(AccountStatus.ACTIVE);
        assertThat(active.getLastLoginAt()).isEqualTo(NOW);
        assertThat(users.existsByEmail("alan@portfolio.local")).isTrue();
        assertThat(users.findByRoleAndStatus(Role.ADMIN, AccountStatus.ACTIVE)).extracting(User::getEmail)
                .containsExactly("ada@portfolio.local");
        assertThat(users.findByRoleAndStatus(Role.ADMIN, AccountStatus.PENDING)).isEmpty();
        assertThat(users.search("%ada%", null, null, FIRST_PAGE)).extracting(User::getEmail)
                .containsExactly("ada@portfolio.local");
        assertThat(users.search(null, Role.USER, AccountStatus.ACTIVE, FIRST_PAGE)).extracting(User::getEmail)
                .containsExactly("alan@portfolio.local");
        assertThat(Tally.zeroFilled(AccountStatus.class, users.tallyByStatus())).containsExactly(
                entry(AccountStatus.PENDING, 0L), entry(AccountStatus.ACTIVE, 2L),
                entry(AccountStatus.LOCKED, 0L), entry(AccountStatus.DISABLED, 0L));
        assertThat(Tally.zeroFilled(Role.class, users.tallyByRole()))
                .containsExactly(entry(Role.USER, 1L), entry(Role.ADMIN, 1L));
    }

    @Test
    void persistsTokensAndRevokesThemInBulk() {
        var owner = users.save(User.register("Grace Hopper", "grace@portfolio.local", "{bcrypt}grace", Role.USER,
                AccountStatus.ACTIVE));
        var family = "01999a4e-3c1b-7d2e-8f00-123456789abc";
        var expiry = NOW.plus(Duration.ofDays(30));
        tokens.save(UserToken.issue(owner, TokenPurpose.REFRESH, "a".repeat(64), family, expiry));
        tokens.save(UserToken.issue(owner, TokenPurpose.REFRESH, "b".repeat(64), family, expiry));
        tokens.save(UserToken.issue(owner, TokenPurpose.PASSWORD_RESET, "c".repeat(64), null, expiry));
        tokens.save(UserToken.issue(owner, TokenPurpose.EMAIL_VERIFICATION, "d".repeat(64), null, NOW.minusSeconds(1)));
        detach();

        var refresh = tokens.findByFingerprintAndPurpose("a".repeat(64), TokenPurpose.REFRESH).orElseThrow();
        assertThat(refresh.getUser().getId()).isEqualTo(owner.getId());
        assertThat(refresh.getFamily()).isEqualTo(family);
        assertThat(refresh.getExpiresAt()).isEqualTo(expiry);
        assertThat(refresh.getCreatedAt()).isNotNull();
        assertThat(refresh.isExpired(NOW)).isFalse();
        assertThat(refresh.isConsumed()).isFalse();

        assertThat(tokens.claim(refresh.getId(), NOW)).isEqualTo(1);
        detach();

        assertThat(tokens.findByFingerprintAndPurpose("a".repeat(64), TokenPurpose.REFRESH))
                .hasValueSatisfying(token -> assertThat(token.getConsumedAt()).isEqualTo(NOW));
        assertThat(tokens.findByFingerprintAndPurpose("a".repeat(64), TokenPurpose.PASSWORD_RESET)).isEmpty();
        assertThat(tokens.deleteExpired(NOW)).isEqualTo(1);
        assertThat(tokens.deleteByUserAndPurpose(owner, TokenPurpose.PASSWORD_RESET)).isEqualTo(1);
        assertThat(tokens.deleteByFamily(family)).isEqualTo(2);
        assertThat(tokens.count()).isZero();
    }

    @Test
    void persistsMessagesWithOrderedAttachments() {
        var envelope = new Envelope(List.of("a@example.test", "b@example.test"), List.of(), List.of("audit@example.test"),
                "reply@example.test", "Quarterly report", "<p>Attached.</p>", true, List.of(
                        new Attachment("report.txt", "text/plain", "alpha".getBytes(UTF_8)),
                        new Attachment("chart.png", "image/png", new byte[] {1, 2, 3})));
        var due = mails.save(MailMessage.compose(envelope, NOW, "req-01999a4e"));
        var later = mails.save(MailMessage.compose(Envelope.html("c@example.test", "Later", "<p>Soon.</p>"),
                NOW.plusSeconds(60), null));
        detach();

        assertThat(mails.attachmentMeta(List.of(later.getId(), due.getId())))
                .extracting(AttachmentMeta::getMessageId, AttachmentMeta::getFilename, AttachmentMeta::getSize)
                .containsExactly(tuple(due.getId(), "report.txt", 5), tuple(due.getId(), "chart.png", 3));
        var reloaded = mails.findById(due.getId()).orElseThrow();
        var attachments = mails.attachmentMeta(List.of(due.getId())).stream().map(AttachmentView::of).toList();
        assertThat(MailView.of(reloaded, attachments)).satisfies(view -> {
            assertThat(view.to()).containsExactly("a@example.test", "b@example.test");
            assertThat(view.cc()).isEmpty();
            assertThat(view.bcc()).containsExactly("audit@example.test");
            assertThat(view.replyTo()).isEqualTo("reply@example.test");
            assertThat(view.status()).isEqualTo(MailStatus.PENDING);
            assertThat(view.scheduledAt()).isEqualTo(NOW);
            assertThat(view.attachments()).extracting(AttachmentView::filename, AttachmentView::contentType,
                    AttachmentView::size).containsExactly(tuple("report.txt", "text/plain", 5),
                    tuple("chart.png", "image/png", 3));
        });
        assertThat(reloaded.envelope()).satisfies(snapshot -> {
            assertThat(snapshot.body()).isEqualTo("<p>Attached.</p>");
            assertThat(snapshot.html()).isTrue();
            assertThat(snapshot.attachments().getFirst().content()).asString(UTF_8).isEqualTo("alpha");
        });
        assertThat(reloaded.getRequestId()).isEqualTo("req-01999a4e");

        assertThat(mails.lockDue(MailStatus.PENDING, NOW, Limit.of(10))).extracting(MailMessage::getId)
                .containsExactly(due.getId());
        assertThat(mails.oldestDue(MailStatus.PENDING, NOW)).contains(NOW);
        assertThat(mails.oldestDue(MailStatus.FAILED, NOW)).isEmpty();
        assertThat(mails.findByStatus(MailStatus.PENDING, FIRST_PAGE).getTotalElements()).isEqualTo(2);

        reloaded.markSent(NOW);
        detach();

        var sent = mails.findById(due.getId()).orElseThrow();
        assertThat(sent.getStatus()).isEqualTo(MailStatus.SENT);
        assertThat(sent.getSentAt()).isEqualTo(NOW);
        assertThat(sent.getVersion()).isEqualTo(1);
        assertThat(Tally.zeroFilled(MailStatus.class, mails.tallyByStatus())).containsExactly(
                entry(MailStatus.PENDING, 1L), entry(MailStatus.SENT, 1L),
                entry(MailStatus.FAILED, 0L), entry(MailStatus.CANCELLED, 0L));
    }

    private void detach() {
        entityManager.flush();
        entityManager.clear();
    }
}
