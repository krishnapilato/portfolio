package com.personal.portfolio.mail;

import static java.nio.charset.StandardCharsets.UTF_8;
import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.entry;
import static org.assertj.core.api.Assertions.tuple;
import static org.junit.jupiter.api.Named.named;
import static org.junit.jupiter.params.provider.Arguments.arguments;

import com.personal.portfolio.mail.MailPayloads.AttachmentView;
import com.personal.portfolio.mail.MailPayloads.BulkReceipt;
import com.personal.portfolio.mail.MailPayloads.BulkRequest;
import com.personal.portfolio.mail.MailPayloads.ComposeRequest;
import com.personal.portfolio.mail.MailPayloads.MailView;
import com.personal.portfolio.mail.MailPayloads.OutboxStats;
import com.personal.portfolio.platform.CorrelationFilter;
import java.time.Duration;
import java.time.Instant;
import java.time.temporal.ChronoUnit;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;
import java.util.stream.IntStream;
import java.util.stream.Stream;
import org.jspecify.annotations.Nullable;
import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.params.ParameterizedTest;
import org.junit.jupiter.params.provider.Arguments;
import org.junit.jupiter.params.provider.EnumSource;
import org.junit.jupiter.params.provider.MethodSource;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.mock.web.MockMultipartFile;
import org.springframework.test.web.servlet.assertj.MvcTestResult;

class MailAdminTests extends OutboxIntegrationTest {

    private static final String MESSAGES = "/api/v1/mail/messages";
    private static final String STATS = "/api/v1/mail/stats";
    private static final Instant PAST = Instant.parse("2020-01-01T00:00:00Z");

    private final List<Long> created = new ArrayList<>();

    @AfterEach
    void withdrawQueuedMessages() {
        created.forEach(this::withdraw);
    }

    @Test
    void composeQueuesAPendingMessageAndReturnsItsLocation() {
        var recipient = address();
        var requestId = "mail-admin-" + UUID.randomUUID();
        var before = clock.instant();

        var result = mvc.post().uri(MESSAGES).with(admin())
                .header(CorrelationFilter.HEADER, requestId)
                .contentType(MediaType.APPLICATION_JSON)
                .content(toJson(new ComposeRequest(List.of(recipient), List.of("cc-" + recipient), null,
                        "support@example.test", "Welcome aboard", "<p>Hello</p>", true, null)))
                .exchange();

        assertThat(result).hasStatus(HttpStatus.ACCEPTED);
        var view = track(read(result, MailView.class));
        assertThat(result).hasHeader(HttpHeaders.LOCATION, "http://localhost" + MESSAGES + "/" + view.id());
        assertThat(view.status()).isEqualTo(MailStatus.PENDING);
        assertThat(view.to()).containsExactly(recipient);
        assertThat(view.cc()).containsExactly("cc-" + recipient);
        assertThat(view.bcc()).isEmpty();
        assertThat(view.replyTo()).isEqualTo("support@example.test");
        assertThat(view.subject()).isEqualTo("Welcome aboard");
        assertThat(view.html()).isTrue();
        assertThat(view.attempts()).isZero();
        assertThat(view.sentAt()).isNull();
        assertThat(view.lastError()).isNull();
        assertThat(view.attachments()).isEmpty();
        assertThat(view.scheduledAt()).isBetween(before, clock.instant());
        assertThat(reload(view.id()).getRequestId()).isEqualTo(requestId);
        assertThat(mvc.get().uri(MESSAGES + "/{id}", view.id()).with(admin()))
                .hasStatusOk()
                .bodyJson()
                .extractingPath("$.subject")
                .isEqualTo("Welcome aboard");
    }

    @Test
    void composeHonoursAFutureSendAt() {
        var sendAt = clock.instant().plus(Duration.ofDays(1)).truncatedTo(ChronoUnit.MICROS);

        var view = compose(new ComposeRequest(List.of(address()), null, null, null, "Later", "Tomorrow", false, sendAt));

        assertThat(view.scheduledAt()).isEqualTo(sendAt);
        assertThat(reload(view.id()).getScheduledAt()).isEqualTo(sendAt);
    }

    @Test
    void multipartComposeStoresEveryAttachment() {
        var csv = "id,name\n1,Ada\n".getBytes(UTF_8);
        var png = new byte[] {(byte) 0x89, 'P', 'N', 'G', '\r', '\n'};
        var pdf = "%PDF-1.7".getBytes(UTF_8);
        var request = new ComposeRequest(List.of(address()), null, List.of(address()), null, "Quarterly report",
                "See the attached files", false, null);

        var result = mvc.post().uri(MESSAGES).multipart()
                .file(new MockMultipartFile("message", "", MediaType.APPLICATION_JSON_VALUE, toJson(request).getBytes(UTF_8)))
                .file(new MockMultipartFile("attachments", "report.csv", "text/csv", csv))
                .file(new MockMultipartFile("attachments", "logo.png", MediaType.IMAGE_PNG_VALUE, png))
                .file(new MockMultipartFile("attachments", "empty.txt", MediaType.TEXT_PLAIN_VALUE, new byte[0]))
                .file(new MockMultipartFile("attachments", "", null, pdf))
                .with(admin())
                .exchange();

        assertThat(result).hasStatus(HttpStatus.ACCEPTED).containsHeader(HttpHeaders.LOCATION);
        var view = track(read(result, MailView.class));
        assertThat(view.status()).isEqualTo(MailStatus.PENDING);
        assertThat(view.attachments()).containsExactly(
                new AttachmentView("report.csv", "text/csv", csv.length),
                new AttachmentView("logo.png", MediaType.IMAGE_PNG_VALUE, png.length),
                new AttachmentView("attachment", MediaType.APPLICATION_OCTET_STREAM_VALUE, pdf.length));
        assertThat(inTransaction(() -> reload(view.id()).envelope().attachments()))
                .extracting(Attachment::filename, Attachment::content)
                .containsExactly(tuple("report.csv", csv), tuple("logo.png", png), tuple("attachment", pdf));
        assertThat(read(mvc.get().uri(MESSAGES + "/{id}", view.id()).with(admin()).exchange(), MailView.class)
                .attachments()).isEqualTo(view.attachments());
        assertThat(page(mvc.get().uri(MESSAGES).with(admin()).queryParam("size", "1").exchange()).content())
                .singleElement()
                .satisfies(listed -> assertThat(listed.attachments()).isEqualTo(view.attachments()));
    }

    @Test
    void multipartComposeAcceptsAtMostFiveAttachments() {
        var stored = messages.count();
        var request = new ComposeRequest(List.of(address()), null, null, null, "Too many", "Files", false, null);
        var builder = mvc.post().uri(MESSAGES).multipart()
                .file(new MockMultipartFile("message", "", MediaType.APPLICATION_JSON_VALUE, toJson(request).getBytes(UTF_8)));
        for (var index = 0; index < 6; index++) {
            builder.file(new MockMultipartFile("attachments", "file-" + index + ".txt", MediaType.TEXT_PLAIN_VALUE,
                    ("file " + index).getBytes(UTF_8)));
        }

        var result = builder.with(admin()).exchange();
        assertThat(result).hasStatus(HttpStatus.BAD_REQUEST);
        assertThat(result).bodyJson().extractingPath("$.type").isEqualTo("urn:problem:validation-failed");
        assertThat(result).bodyJson().extractingPath("$.errors").asMap()
                .containsOnly(entry("attachments", "size must be between 0 and 5"));
        assertThat(messages.count()).isEqualTo(stored);
    }

    @Test
    void multipartComposeRejectsAnInvalidMessagePart() {
        var stored = messages.count();

        var result = composeMultipart(new ComposeRequest(List.of("Ada Lovelace <ada@example.test>"), null, null, null,
                "Invalid", "Body", false, null));

        assertThat(result).hasStatus(HttpStatus.BAD_REQUEST);
        assertThat(messages.count()).isEqualTo(stored);
    }

    @Test
    void multipartComposeReportsFieldErrorsLikeTheJsonVariant() {
        var result = composeMultipart(new ComposeRequest(List.of("Ada Lovelace <ada@example.test>"), null, null, null,
                "Invalid", "Body", false, null));

        assertThat(result).hasStatus(HttpStatus.BAD_REQUEST).hasContentType(MediaType.APPLICATION_PROBLEM_JSON);
        assertThat(result).bodyJson().extractingPath("$.type").isEqualTo("urn:problem:validation-failed");
        assertThat(result).bodyJson().extractingPath("$.title").isEqualTo("Validation failed");
        assertThat(result).bodyJson().extractingPath("$.errors").asMap()
                .containsOnly(entry("to[0]", "must be a plain e-mail address"));
    }

    static Stream<Arguments> invalidCompositions() {
        var one = List.of("ada@example.test");
        var eleven = IntStream.rangeClosed(1, 11).mapToObj(index -> "user" + index + "@example.test").toList();
        return Stream.of(
                arguments(named("eleven recipients", request(eleven, null, null, null, "Subject", "Body", null)), "to"),
                arguments(named("no recipients", request(List.of(), null, null, null, "Subject", "Body", null)), "to"),
                arguments(named("invalid recipient", request(List.of("not-an-email"), null, null, null, "Subject",
                        "Body", null)), "to[0]"),
                arguments(named("eleven cc", request(one, eleven, null, null, "Subject", "Body", null)), "cc"),
                arguments(named("eleven bcc", request(one, null, eleven, null, "Subject", "Body", null)), "bcc"),
                arguments(named("invalid reply-to", request(one, null, null, "reply-to", "Subject", "Body", null)),
                        "replyTo"),
                arguments(named("blank subject", request(one, null, null, null, " ", "Body", null)), "subject"),
                arguments(named("subject too long", request(one, null, null, null, "s".repeat(201), "Body", null)),
                        "subject"),
                arguments(named("blank body", request(one, null, null, null, "Subject", "", null)), "body"),
                arguments(named("sendAt in the past", request(one, null, null, null, "Subject", "Body", PAST)),
                        "sendAt"));
    }

    @ParameterizedTest
    @MethodSource("invalidCompositions")
    void composeRejectsInvalidRequests(ComposeRequest request, String field) {
        var result = mvc.post().uri(MESSAGES).with(admin())
                .contentType(MediaType.APPLICATION_JSON)
                .content(toJson(request))
                .exchange();

        assertThat(result).hasStatus(HttpStatus.BAD_REQUEST);
        assertThat(result).bodyJson().extractingPath("$.type").isEqualTo("urn:problem:validation-failed");
        assertThat(result).bodyJson().extractingPath("$.errors").asMap().containsKey(field);
    }

    static Stream<String> nonPlainAddresses() {
        return Stream.of(
                "\"ada,lovelace\"@example.test",
                "\"ada lovelace\"@example.test",
                "\"ada\"@example.test",
                "ada lovelace@example.test",
                "ada@example.test,alan@example.test",
                "ada@example.test;alan@example.test",
                "Ada Lovelace <ada@example.test>",
                "ada@example.test ",
                "a".repeat(64) + "@" + ("b".repeat(60) + ".").repeat(4) + "test");
    }

    @ParameterizedTest
    @MethodSource("nonPlainAddresses")
    void rejectsAddressesThatAreNotPlainMailboxes(String address) {
        var plain = List.of("ada@example.test");
        assertRejected(request(List.of(address), null, null, null, "Subject", "Body", null), "to[0]");
        assertRejected(request(plain, List.of(address), null, null, "Subject", "Body", null), "cc[0]");
        assertRejected(request(plain, null, List.of(address), null, "Subject", "Body", null), "bcc[0]");
        assertRejected(request(plain, null, null, address, "Subject", "Body", null), "replyTo");
        var bulk = mvc.post().uri(MESSAGES + "/bulk").with(admin())
                .contentType(MediaType.APPLICATION_JSON)
                .content(toJson(new BulkRequest(List.of("ada@example.test", address), "Subject", "Body", false, null)))
                .exchange();
        assertThat(bulk).hasStatus(HttpStatus.BAD_REQUEST);
        assertThat(bulk).bodyJson().extractingPath("$.errors").asMap().containsKey("recipients[1]");
    }

    @Test
    void bulkQueuesOneMessagePerDistinctRecipient() {
        var first = address();
        var second = address();
        var third = address();

        var result = mvc.post().uri(MESSAGES + "/bulk").with(admin())
                .contentType(MediaType.APPLICATION_JSON)
                .content(toJson(new BulkRequest(List.of(first, second, first, third), "Newsletter", "<h1>News</h1>",
                        true, null)))
                .exchange();

        assertThat(result).hasStatus(HttpStatus.ACCEPTED).doesNotContainHeader(HttpHeaders.LOCATION);
        var receipt = read(result, BulkReceipt.class);
        created.addAll(receipt.ids());
        assertThat(receipt.queued()).isEqualTo(3);
        assertThat(receipt.ids()).hasSize(3).doesNotHaveDuplicates();
        assertThat(receipt.ids().stream().map(this::reload).toList())
                .extracting(MailMessage::getRecipients, MailMessage::getSubject, MailMessage::isHtml,
                        MailMessage::getStatus)
                .containsExactly(
                        tuple(List.of(first), "Newsletter", true, MailStatus.PENDING),
                        tuple(List.of(second), "Newsletter", true, MailStatus.PENDING),
                        tuple(List.of(third), "Newsletter", true, MailStatus.PENDING));
    }

    @Test
    void bulkRejectsEmptyAndOversizedRecipientLists() {
        var tooMany = IntStream.rangeClosed(1, 501).mapToObj(index -> "reader" + index + "@example.test").toList();

        for (var recipients : List.of(List.<String>of(), tooMany)) {
            var result = mvc.post().uri(MESSAGES + "/bulk").with(admin())
                    .contentType(MediaType.APPLICATION_JSON)
                    .content(toJson(new BulkRequest(recipients, "Subject", "Body", false, null)))
                    .exchange();
            assertThat(result).hasStatus(HttpStatus.BAD_REQUEST);
            assertThat(result).bodyJson().extractingPath("$.errors").asMap().containsKey("recipients");
        }
    }

    @Test
    void listFiltersByStatusAndPagesNewestFirst() {
        var subject = "Paging " + UUID.randomUUID();
        var ids = new ArrayList<Long>();
        for (var index = 0; index < 3; index++) {
            var view = compose(new ComposeRequest(List.of(address()), null, null, null, subject, "Body", false, null));
            assertThat(cancel(view.id())).hasStatusOk();
            ids.add(view.id());
        }

        var firstPage = page(mvc.get().uri(MESSAGES).with(admin())
                .queryParam("status", "CANCELLED").queryParam("size", "2").queryParam("page", "0")
                .queryParam("sort", "createdAt,desc")
                .exchange());
        var secondPage = page(mvc.get().uri(MESSAGES).with(admin())
                .queryParam("status", "CANCELLED").queryParam("size", "2").queryParam("page", "1")
                .queryParam("sort", "createdAt,desc")
                .exchange());
        var newest = page(mvc.get().uri(MESSAGES).with(admin()).queryParam("size", "1").exchange());

        assertThat(firstPage.content()).extracting(MailView::id).containsExactly(ids.get(2), ids.get(1));
        assertThat(firstPage.content()).extracting(MailView::status).containsOnly(MailStatus.CANCELLED);
        assertThat(firstPage.page().size()).isEqualTo(2);
        assertThat(firstPage.page().number()).isZero();
        assertThat(firstPage.page().totalElements()).isGreaterThanOrEqualTo(3);
        assertThat(secondPage.page().number()).isEqualTo(1);
        assertThat(secondPage.content()).extracting(MailView::status).containsOnly(MailStatus.CANCELLED);
        assertThat(secondPage.content().getFirst().id()).isEqualTo(ids.getFirst());
        assertThat(newest.content()).extracting(MailView::id).containsExactly(ids.get(2));
    }

    @Test
    void listAnswersAnEmptyPageBeyondTheLastMessage() {
        var beyond = page(mvc.get().uri(MESSAGES).with(admin()).queryParam("page", "100000").exchange());

        assertThat(beyond.content()).isEmpty();
        assertThat(beyond.page().number()).isEqualTo(100000);
    }

    @Test
    void listRejectsUnsupportedSortPropertiesAndUnknownStatuses() {
        assertThat(mvc.get().uri(MESSAGES).with(admin()).queryParam("sort", "subject"))
                .hasStatus(HttpStatus.BAD_REQUEST)
                .bodyJson()
                .extractingPath("$.allowed")
                .asArray()
                .containsExactly("createdAt", "scheduledAt", "status");
        assertThat(mvc.get().uri(MESSAGES).with(admin()).queryParam("status", "BOUNCED"))
                .hasStatus(HttpStatus.BAD_REQUEST);
    }

    @Test
    void getAnswersNotFoundForUnknownMessages() {
        var result = mvc.get().uri(MESSAGES + "/{id}", Long.MAX_VALUE).with(admin()).exchange();

        assertThat(result).hasStatus(HttpStatus.NOT_FOUND);
        assertThat(result).bodyJson().extractingPath("$.type").isEqualTo("urn:problem:not-found");
        assertThat(result).bodyJson().extractingPath("$.detail")
                .isEqualTo("mail '" + Long.MAX_VALUE + "' does not exist");
        assertThat(cancel(Long.MAX_VALUE)).hasStatus(HttpStatus.NOT_FOUND);
        assertThat(retry(Long.MAX_VALUE)).hasStatus(HttpStatus.NOT_FOUND);
    }

    @Test
    void cancelWithdrawsAPendingMessageOnlyOnce() {
        var view = compose(new ComposeRequest(List.of(address()), null, null, null, "Oops", "Wrong", false, null));

        var cancelled = cancel(view.id());
        assertThat(cancelled).hasStatusOk();
        assertThat(read(cancelled, MailView.class).status()).isEqualTo(MailStatus.CANCELLED);
        assertThat(reload(view.id()).getStatus()).isEqualTo(MailStatus.CANCELLED);

        var again = cancel(view.id());
        assertThat(again).hasStatus(HttpStatus.CONFLICT);
        assertThat(again).bodyJson().extractingPath("$.type").isEqualTo("urn:problem:mail-not-modifiable");
        assertThat(again).bodyJson().extractingPath("$.title").isEqualTo("Message can no longer be modified");
        assertThat(again).bodyJson().extractingPath("$.detail")
                .isEqualTo("Message " + view.id() + " is cancelled");
    }

    @ParameterizedTest
    @EnumSource(value = MailStatus.class, names = {"FAILED", "CANCELLED"})
    void retryReschedulesFailedAndCancelledMessages(MailStatus status) {
        var message = MailMessage.compose(Envelope.html(address(), "Retry me", "<p>Again</p>"), PAST, null);
        if (status == MailStatus.FAILED) {
            message.markFailed("550 mailbox unavailable", PAST, 1, Duration.ofSeconds(30), Duration.ofHours(1));
        } else {
            message.cancel();
        }
        var id = messages.save(message).getId();
        created.add(id);
        var before = clock.instant();

        var result = retry(id);

        assertThat(result).hasStatusOk();
        var view = read(result, MailView.class);
        assertThat(view.status()).isEqualTo(MailStatus.PENDING);
        assertThat(view.attempts()).isZero();
        assertThat(view.scheduledAt()).isBetween(before, clock.instant());
        assertThat(reload(id).getStatus()).isEqualTo(MailStatus.PENDING);
        assertThat(retry(id)).hasStatus(HttpStatus.CONFLICT)
                .bodyJson()
                .extractingPath("$.detail")
                .isEqualTo("Message " + id + " is pending");
    }

    @Test
    void retryAndCancelRejectSentMessages() {
        var message = MailMessage.compose(Envelope.html(address(), "Done", "<p>Sent</p>"), PAST, null);
        message.markSent(PAST);
        var id = messages.save(message).getId();

        assertThat(retry(id)).hasStatus(HttpStatus.CONFLICT);
        assertThat(cancel(id)).hasStatus(HttpStatus.CONFLICT);
        assertThat(reload(id).getStatus()).isEqualTo(MailStatus.SENT);
    }

    @Test
    void statsCountMessagesByStatus() {
        var before = stats();
        var pending = compose(new ComposeRequest(List.of(address()), null, null, null, "Count me", "Body", false, null));
        var withdrawn = compose(new ComposeRequest(List.of(address()), null, null, null, "Skip me", "Body", false, null));
        assertThat(cancel(withdrawn.id())).hasStatusOk();

        var after = stats();

        assertThat(after.byStatus()).containsOnlyKeys(MailStatus.values());
        assertThat(after.byStatus().get(MailStatus.PENDING)).isEqualTo(before.byStatus().get(MailStatus.PENDING) + 1);
        assertThat(after.byStatus().get(MailStatus.CANCELLED))
                .isEqualTo(before.byStatus().get(MailStatus.CANCELLED) + 1);
        assertThat(after.byStatus().get(MailStatus.SENT)).isEqualTo(before.byStatus().get(MailStatus.SENT));
        assertThat(after.byStatus().get(MailStatus.FAILED)).isEqualTo(before.byStatus().get(MailStatus.FAILED));
        assertThat(after.oldestDue()).isNotNull().isBeforeOrEqualTo(reload(pending.id()).getScheduledAt());
    }

    @Test
    void mailAdministrationRequiresTheAdminRole() {
        var request = toJson(new ComposeRequest(List.of(address()), null, null, null, "Hi", "Body", false, null));

        assertThat(mvc.get().uri(MESSAGES)).hasStatus(HttpStatus.UNAUTHORIZED);
        assertThat(mvc.get().uri(MESSAGES).with(user(1))).hasStatus(HttpStatus.FORBIDDEN);
        assertThat(mvc.get().uri(STATS).with(user(1))).hasStatus(HttpStatus.FORBIDDEN);
        assertThat(mvc.post().uri(MESSAGES).with(user(1)).contentType(MediaType.APPLICATION_JSON).content(request))
                .hasStatus(HttpStatus.FORBIDDEN);
        assertThat(mvc.post().uri(MESSAGES + "/bulk").contentType(MediaType.APPLICATION_JSON).content(request))
                .hasStatus(HttpStatus.UNAUTHORIZED);
    }

    private static ComposeRequest request(List<String> to, @Nullable List<String> cc, @Nullable List<String> bcc,
            @Nullable String replyTo, String subject, String body, @Nullable Instant sendAt) {
        return new ComposeRequest(to, cc, bcc, replyTo, subject, body, false, sendAt);
    }

    private void assertRejected(ComposeRequest request, String field) {
        var result = mvc.post().uri(MESSAGES).with(admin())
                .contentType(MediaType.APPLICATION_JSON)
                .content(toJson(request))
                .exchange();
        assertThat(result).hasStatus(HttpStatus.BAD_REQUEST);
        assertThat(result).bodyJson().extractingPath("$.errors").asMap()
                .containsEntry(field, "must be a plain e-mail address");
    }

    private MvcTestResult composeMultipart(ComposeRequest request) {
        return mvc.post().uri(MESSAGES).multipart()
                .file(new MockMultipartFile("message", "", MediaType.APPLICATION_JSON_VALUE, toJson(request).getBytes(UTF_8)))
                .file(new MockMultipartFile("attachments", "notes.txt", MediaType.TEXT_PLAIN_VALUE, "notes".getBytes(UTF_8)))
                .with(admin())
                .exchange();
    }

    private MailView compose(ComposeRequest request) {
        var result = mvc.post().uri(MESSAGES).with(admin())
                .contentType(MediaType.APPLICATION_JSON)
                .content(toJson(request))
                .exchange();
        assertThat(result).hasStatus(HttpStatus.ACCEPTED);
        return track(read(result, MailView.class));
    }

    private MailView track(MailView view) {
        created.add(view.id());
        return view;
    }

    private MvcTestResult cancel(long id) {
        return mvc.post().uri(MESSAGES + "/{id}/cancel", id).with(admin()).exchange();
    }

    private MvcTestResult retry(long id) {
        return mvc.post().uri(MESSAGES + "/{id}/retry", id).with(admin()).exchange();
    }

    private OutboxStats stats() {
        var result = mvc.get().uri(STATS).with(admin()).exchange();
        assertThat(result).hasStatusOk();
        return read(result, OutboxStats.class);
    }

    private MailPage page(MvcTestResult result) {
        assertThat(result).hasStatusOk();
        return read(result, MailPage.class);
    }

    record MailPage(List<MailView> content, PageMetadata page) {}

    record PageMetadata(int size, int number, long totalElements) {}
}
