package com.personal.portfolio.user;

import static org.assertj.core.api.Assertions.assertThat;

import com.personal.portfolio.support.IntegrationTest;
import com.personal.portfolio.user.UserPayloads.UserStats;
import com.personal.portfolio.user.UserPayloads.UserView;
import java.util.Comparator;
import java.util.HashMap;
import java.util.List;
import java.util.Locale;
import java.util.Map;
import java.util.Objects;
import java.util.UUID;
import java.util.stream.Stream;
import org.jspecify.annotations.Nullable;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.junit.jupiter.params.ParameterizedTest;
import org.junit.jupiter.params.provider.Arguments;
import org.junit.jupiter.params.provider.CsvSource;
import org.junit.jupiter.params.provider.EnumSource;
import org.junit.jupiter.params.provider.MethodSource;
import org.junit.jupiter.params.provider.ValueSource;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.system.CapturedOutput;
import org.springframework.boot.test.system.OutputCaptureExtension;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpMethod;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.test.web.servlet.assertj.MvcTestResult;
import org.springframework.test.web.servlet.request.RequestPostProcessor;
import tools.jackson.databind.json.JsonMapper;

@ExtendWith(OutputCaptureExtension.class)
class UserAdminTests extends IntegrationTest {

    private static final String USERS = "/api/v1/users";
    private static final String PASSWORD = "Str0ng-Passw0rd";
    private static final String SEEDED_ADMIN = "admin@test.local";
    private static final List<String> SORTABLE =
            List.of("createdAt", "email", "fullName", "lastLoginAt", "role", "status", "updatedAt");

    private final String marker = UUID.randomUUID().toString().replace("-", "").substring(0, 12);

    @Autowired
    private UserRepository users;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @Autowired
    private JsonMapper json;

    @Test
    void searchFiltersByTextRoleAndStatus() {
        var grace = persist("Grace Hopper", email("grace"), Role.USER, AccountStatus.ACTIVE);
        var barbara = persist("Barbara " + marker.toUpperCase(Locale.ROOT), unrelatedEmail(), Role.ADMIN, AccountStatus.ACTIVE);
        var edsger = persist("Edsger Dijkstra", email("edsger"), Role.USER, AccountStatus.DISABLED);

        assertThat(emails(page("?q={q}", marker)))
                .containsExactlyInAnyOrder(grace.getEmail(), barbara.getEmail(), edsger.getEmail());
        assertThat(emails(page("?q={q}", " " + marker.toUpperCase(Locale.ROOT) + " ")))
                .containsExactlyInAnyOrder(grace.getEmail(), barbara.getEmail(), edsger.getEmail());
        assertThat(emails(page("?q={q}&role=ADMIN", marker))).containsExactly(barbara.getEmail());
        assertThat(emails(page("?q={q}&status=DISABLED", marker))).containsExactly(edsger.getEmail());
        assertThat(emails(page("?q={q}&role=USER&status=ACTIVE", marker))).containsExactly(grace.getEmail());
        assertThat(emails(page("?q={q}&role=ADMIN&status=DISABLED", marker))).isEmpty();
    }

    @Test
    void searchNeverTreatsQueryCharactersAsWildcards() {
        var lookalike = persist("Ratio 50xy" + marker, unrelatedEmail(), Role.USER, AccountStatus.ACTIVE);

        assertThat(emails(page("?q={q}", "50__" + marker))).isEmpty();
        assertThat(emails(page("?q={q}", "50%" + marker))).isEmpty();
        assertThat(emails(page("?q={q}", "%" + marker))).isEmpty();
        assertThat(emails(page("?q={q}", "50xy" + marker))).containsExactly(lookalike.getEmail());
    }

    @Test
    void searchMatchesWildcardEscapeAndBackslashCharactersLiterally() {
        var percent = persist("Ratio 50%_" + marker, unrelatedEmail(), Role.USER, AccountStatus.ACTIVE);
        var path = persist("Path C:\\" + marker, unrelatedEmail(), Role.USER, AccountStatus.ACTIVE);
        var bang = persist("Wow!" + marker, unrelatedEmail(), Role.USER, AccountStatus.ACTIVE);

        assertThat(emails(page("?q={q}", "50%_" + marker))).containsExactly(percent.getEmail());
        assertThat(emails(page("?q={q}", "c:\\" + marker))).containsExactly(path.getEmail());
        assertThat(emails(page("?q={q}", "wow!" + marker))).containsExactly(bang.getEmail());
        assertThat(emails(page("?q={q}", "w!%" + marker))).isEmpty();
    }

    @Test
    void blankQueriesDoNotFilter() {
        assertThat(page("?q={q}&size=1", "   ").page().totalElements()).isEqualTo(users.count());
    }

    @Test
    void pagesResultsWithDtoMetadata() {
        var first = persist("Paged One", email("a"), Role.USER, AccountStatus.ACTIVE);
        var second = persist("Paged Two", email("b"), Role.USER, AccountStatus.ACTIVE);
        var third = persist("Paged Three", email("c"), Role.USER, AccountStatus.ACTIVE);

        var result = mvc.get().uri(USERS + "?q={q}&size=2&page=0&sort=email,asc", marker).with(admin()).exchange();
        assertThat(result).hasStatusOk().hasContentTypeCompatibleWith(MediaType.APPLICATION_JSON)
                .bodyJson().extractingPath("$").asMap().containsOnlyKeys("content", "page");
        var firstPage = read(result, PageBody.class);
        assertThat(firstPage.page()).isEqualTo(new PageMeta(2, 0, 3, 2));
        assertThat(emails(firstPage)).containsExactly(first.getEmail(), second.getEmail());

        var lastPage = page("?q={q}&size=2&page=1&sort=email,asc", marker);
        assertThat(lastPage.page()).isEqualTo(new PageMeta(2, 1, 3, 2));
        assertThat(emails(lastPage)).containsExactly(third.getEmail());

        var beyond = page("?q={q}&size=2&page=5", marker);
        assertThat(beyond.content()).isEmpty();
        assertThat(beyond.page()).isEqualTo(new PageMeta(2, 5, 3, 2));

        assertThat(emails(page("?q={q}&sort=email,desc", marker)))
                .containsExactly(third.getEmail(), second.getEmail(), first.getEmail());
        assertThat(emails(page("?q={q}&sort=fullName,asc", marker)))
                .containsExactly(first.getEmail(), third.getEmail(), second.getEmail());
    }

    @Test
    void defaultsToTwentyNewestFirstAndCapsThePageSize() {
        persist("Early Bird", email("early"), Role.USER, AccountStatus.ACTIVE);
        persist("Late Comer", email("late"), Role.USER, AccountStatus.ACTIVE);

        var defaults = page("?q={q}", marker);
        assertThat(defaults.page().size()).isEqualTo(20);
        assertThat(defaults.page().number()).isZero();
        assertThat(defaults.content()).hasSize(2).extracting(UserView::createdAt)
                .isSortedAccordingTo(Comparator.reverseOrder());

        assertThat(page("?size=500").page().size()).isEqualTo(100);
    }

    @ParameterizedTest
    @ValueSource(strings = {"createdAt", "updatedAt", "fullName", "email", "lastLoginAt", "status", "role"})
    void sortsByEveryWhitelistedProperty(String property) {
        assertThat(mvc.get().uri(USERS + "?size=5&sort={sort}", property + ",desc").with(admin())).hasStatusOk();
    }

    @ParameterizedTest
    @ValueSource(strings = {"passwordHash", "failedLogins", "lockedUntil", "version", "id", "nope"})
    void rejectsSortingOutsideTheWhitelist(String property) {
        var result = mvc.get().uri(USERS + "?sort={sort}", property + ",asc").with(admin()).exchange();

        assertProblem(result, HttpStatus.BAD_REQUEST, "unsupported-sort", "Unsupported sort property");
        assertThat(result).bodyJson().extractingPath("$.detail")
                .isEqualTo("Sorting by '%s' is not supported".formatted(property));
        assertThat(result).bodyJson().extractingPath("$.allowed").asArray().containsExactlyElementsOf(SORTABLE);
    }

    @Test
    void rejectsAnUnsupportedPropertyAmongSeveralSorts() {
        var result = mvc.get().uri(USERS + "?sort=email,asc&sort=passwordHash,desc").with(admin()).exchange();

        assertProblem(result, HttpStatus.BAD_REQUEST, "unsupported-sort", "Unsupported sort property");
        assertThat(result).bodyJson().extractingPath("$.detail").isEqualTo("Sorting by 'passwordHash' is not supported");
    }

    @Test
    void rejectsAnOverlongSearchText() {
        var result = mvc.get().uri(USERS + "?q={q}", "x".repeat(101)).with(admin()).exchange();

        assertProblem(result, HttpStatus.BAD_REQUEST, "validation-failed", "Validation failed");
        assertThat(result).bodyJson().extractingPath("$.errors").asMap().containsOnlyKeys("q");
    }

    @ParameterizedTest
    @ValueSource(strings = {"?role=ROOT", "?status=FROZEN"})
    void rejectsUnknownFilterValues(String query) {
        assertThat(mvc.get().uri(USERS + query).with(admin())).hasStatus(HttpStatus.BAD_REQUEST);
    }

    @Test
    void statsCountEveryStatusAndRole() {
        var before = stats();

        persist("Pending Pat", email("pending"), Role.USER, AccountStatus.PENDING);
        persist("Locked Lou", email("locked"), Role.ADMIN, AccountStatus.LOCKED);
        persist("Disabled Dee", email("disabled"), Role.USER, AccountStatus.DISABLED);
        var after = stats();

        assertThat(after.byStatus()).containsOnlyKeys(AccountStatus.values());
        assertThat(after.byRole()).containsOnlyKeys(Role.values());
        for (var status : AccountStatus.values()) {
            assertThat(after.byStatus()).containsEntry(status,
                    users.findAll().stream().filter(user -> user.getStatus() == status).count());
        }
        assertThat(after.total()).isEqualTo(users.count())
                .isEqualTo(sum(after.byStatus()))
                .isEqualTo(sum(after.byRole()));
        assertThat(after.total() - before.total()).isEqualTo(3);
        assertThat(delta(before.byStatus(), after.byStatus())).containsExactlyInAnyOrderEntriesOf(Map.of(
                AccountStatus.PENDING, 1L, AccountStatus.ACTIVE, 0L, AccountStatus.LOCKED, 1L, AccountStatus.DISABLED, 1L));
        assertThat(delta(before.byRole(), after.byRole()))
                .containsExactlyInAnyOrderEntriesOf(Map.of(Role.USER, 2L, Role.ADMIN, 1L));
    }

    @Test
    void statsListEveryKeyInDeclarationOrder() {
        var result = mvc.get().uri(USERS + "/stats").with(admin()).exchange();

        assertThat(result).hasStatusOk();
        var body = json.readTree(result.getResponse().getContentAsByteArray());
        assertThat(body.get("byStatus").propertyNames()).containsExactly("PENDING", "ACTIVE", "LOCKED", "DISABLED");
        assertThat(body.get("byRole").propertyNames()).containsExactly("USER", "ADMIN");
    }

    @Test
    void getReturnsTheAccount() {
        var stored = reload(persist("Katherine Johnson", email("katherine"), Role.USER, AccountStatus.PENDING).getId());

        var result = mvc.get().uri(USERS + "/{id}", stored.getId()).with(admin()).exchange();

        assertThat(result).hasStatusOk();
        assertThat(read(result, UserView.class)).isEqualTo(UserView.of(stored));
        assertThat(result).bodyJson().extractingPath("$").asMap()
                .doesNotContainKeys("passwordHash", "failedLogins", "lockedUntil", "version");
    }

    @Test
    void getReportsUnknownAccountsAsNotFound() {
        var result = mvc.get().uri(USERS + "/{id}", Long.MAX_VALUE).with(admin()).exchange();

        assertProblem(result, HttpStatus.NOT_FOUND, "not-found", "Resource not found");
        assertThat(result).bodyJson().extractingPath("$.detail")
                .isEqualTo("user '%d' does not exist".formatted(Long.MAX_VALUE));
    }

    @Test
    void getRejectsNonNumericIds() {
        assertThat(mvc.get().uri(USERS + "/grace").with(admin())).hasStatus(HttpStatus.BAD_REQUEST);
    }

    @Test
    void createsAnActiveAccountWithAnEncodedPassword() {
        var email = "Grace." + marker + "@Example.TEST";

        var result = create(body("  Grace Hopper  ", email, PASSWORD, "ADMIN"));

        assertThat(result).hasStatus(HttpStatus.CREATED);
        var view = read(result, UserView.class);
        assertThat(result).hasHeader(HttpHeaders.LOCATION, "http://localhost" + USERS + "/" + view.id());
        assertThat(view.fullName()).isEqualTo("Grace Hopper");
        assertThat(view.email()).isEqualTo(email.toLowerCase(Locale.ROOT));
        assertThat(view.role()).isEqualTo(Role.ADMIN);
        assertThat(view.status()).isEqualTo(AccountStatus.ACTIVE);
        assertThat(view.lastLoginAt()).isNull();
        assertThat(result).bodyJson().extractingPath("$").asMap().doesNotContainKeys("password", "passwordHash");

        var stored = reload(view.id());
        assertThat(stored.getPasswordHash()).startsWith("{bcrypt}");
        assertThat(passwordEncoder.matches(PASSWORD, stored.getPasswordHash())).isTrue();

        var location = Objects.requireNonNull(result.getResponse().getHeader(HttpHeaders.LOCATION));
        var fetched = mvc.get().uri(location).with(admin()).exchange();
        assertThat(fetched).hasStatusOk();
        assertThat(read(fetched, UserView.class).id()).isEqualTo(view.id());
    }

    @Test
    void createdAccountsCanSignInImmediately() {
        var email = email("signin");
        createViaApi("Signing In", email, Role.USER);

        assertThat(login(email)).hasStatusOk().bodyJson().extractingPath("$.tokenType").isEqualTo("Bearer");
    }

    @Test
    void rejectsDuplicateEmailsRegardlessOfCase() {
        var email = email("dup");
        createViaApi("Original", email, Role.USER);

        for (var variant : List.of(email, email.toUpperCase(Locale.ROOT), "Dup." + marker + "@Example.Test")) {
            var result = create(body("Impostor", variant, PASSWORD, "ADMIN"));

            assertProblem(result, HttpStatus.CONFLICT, "email-taken", "Email already registered");
            assertThat(result).bodyJson().extractingPath("$.detail")
                    .isEqualTo("An account for %s already exists".formatted(email));
        }
        assertThat(page("?q={q}", marker).page().totalElements()).isEqualTo(1);
        assertThat(reload(users.findByEmail(email).orElseThrow().getId()).getFullName()).isEqualTo("Original");
    }

    @ParameterizedTest(name = "[{index}] {0} = {1}")
    @MethodSource("invalidCreations")
    void rejectsInvalidCreations(String field, @Nullable String value) {
        var request = body("Valid Name", email("invalid"), PASSWORD, "USER");
        request.put(field, value);

        var result = create(request);

        assertProblem(result, HttpStatus.BAD_REQUEST, "validation-failed", "Validation failed");
        assertThat(result).bodyJson().extractingPath("$.errors").asMap().containsOnlyKeys(field);
        assertThat(users.existsByEmail(email("invalid"))).isFalse();
    }

    static Stream<Arguments> invalidCreations() {
        return Stream.of(
                Arguments.of("fullName", " "),
                Arguments.of("fullName", "x".repeat(101)),
                Arguments.of("fullName", null),
                Arguments.of("email", "not-an-email"),
                Arguments.of("email", ""),
                Arguments.of("email", "a".repeat(250) + "@example.test"),
                Arguments.of("password", "Sh0rt"),
                Arguments.of("password", "no-upper-case-1"),
                Arguments.of("password", "NO-LOWER-CASE-1"),
                Arguments.of("password", "No-Digits-Here"),
                Arguments.of("password", null),
                Arguments.of("role", null));
    }

    @ParameterizedTest
    @ValueSource(strings = {"\"a,%s\"@example.test", "\"a;%s\"@example.test", "\"a %s\"@example.test"})
    void rejectsEmailsTheOutboxCannotAddress(String template) {
        var email = template.formatted(marker);

        var result = create(body("Quoted Local Part", email, PASSWORD, "USER"));

        assertProblem(result, HttpStatus.BAD_REQUEST, "validation-failed", "Validation failed");
        assertThat(result).bodyJson().extractingPath("$.errors").asMap().containsOnlyKeys("email");
        assertThat(users.existsByEmail(email)).isFalse();
    }

    @Test
    void rejectsUnknownRolesOnCreation() {
        assertThat(create(body("Valid Name", email("root"), PASSWORD, "ROOT"))).hasStatus(HttpStatus.BAD_REQUEST);
        assertThat(users.existsByEmail(email("root"))).isFalse();
    }

    @Test
    void patchRenamesAndReassignsTheRole() {
        var user = reload(persist("Grace Hopper", email("patch"), Role.USER, AccountStatus.ACTIVE).getId());
        letTheClockPass(user.getUpdatedAt());

        var renamed = patch(user.getId(), Map.of("fullName", "  Rear Admiral Hopper  "), admin());
        assertThat(renamed).hasStatusOk();
        var renamedView = read(renamed, UserView.class);
        assertThat(renamedView).extracting(UserView::fullName, UserView::role)
                .containsExactly("Rear Admiral Hopper", Role.USER);
        assertThat(renamedView.updatedAt()).isAfter(user.getUpdatedAt());

        var promoted = patch(user.getId(), Map.of("role", "ADMIN"), admin());
        assertThat(promoted).hasStatusOk();
        var promotedView = read(promoted, UserView.class);
        assertThat(promotedView).extracting(UserView::fullName, UserView::role)
                .containsExactly("Rear Admiral Hopper", Role.ADMIN);

        var stored = reload(user.getId());
        assertThat(UserView.of(stored)).isEqualTo(promotedView);
        assertThat(stored.getEmail()).isEqualTo(user.getEmail());
        assertThat(stored.getStatus()).isEqualTo(AccountStatus.ACTIVE);
        assertThat(stored.getVersion()).isEqualTo(2);
    }

    @Test
    void patchWithoutChangesLeavesTheAccountUntouched() {
        var user = persist("Grace Hopper", email("noop"), Role.USER, AccountStatus.ACTIVE);
        var nulls = new HashMap<String, @Nullable Object>();
        nulls.put("fullName", null);
        nulls.put("role", null);

        for (var request : List.<Map<String, ?>>of(Map.of(), nulls, Map.of("role", "USER"))) {
            var result = patch(user.getId(), request, admin());
            assertThat(result).hasStatusOk();
            assertThat(read(result, UserView.class)).extracting(UserView::fullName, UserView::role)
                    .containsExactly("Grace Hopper", Role.USER);
        }
        assertThat(reload(user.getId()).getVersion()).isZero();
    }

    @ParameterizedTest
    @MethodSource("invalidNames")
    void patchRejectsBlankOrOverlongNames(String fullName) {
        var user = persist("Grace Hopper", email("blank"), Role.USER, AccountStatus.ACTIVE);

        var result = patch(user.getId(), Map.of("fullName", fullName), admin());

        assertProblem(result, HttpStatus.BAD_REQUEST, "validation-failed", "Validation failed");
        assertThat(result).bodyJson().extractingPath("$.errors").asMap().containsOnlyKeys("fullName");
        assertThat(reload(user.getId()).getFullName()).isEqualTo("Grace Hopper");
    }

    static Stream<String> invalidNames() {
        return Stream.of("", "   ", "\t\n", "x".repeat(101));
    }

    @Test
    void patchRejectsUnknownRoles() {
        var user = persist("Grace Hopper", email("role"), Role.USER, AccountStatus.ACTIVE);

        assertThat(patch(user.getId(), Map.of("role", "ROOT"), admin())).hasStatus(HttpStatus.BAD_REQUEST);
        assertThat(reload(user.getId()).getRole()).isEqualTo(Role.USER);
    }

    @Test
    void patchReportsUnknownAccountsAsNotFound() {
        assertProblem(patch(Long.MAX_VALUE, Map.of("fullName", "Nobody"), admin()), HttpStatus.NOT_FOUND, "not-found",
                "Resource not found");
    }

    @Test
    void administratorsCannotChangeTheirOwnRole() {
        var self = seededAdminId();

        var result = patch(self, Map.of("role", "USER"), admin(self));

        assertProblem(result, HttpStatus.CONFLICT, "self-management", "Self management not allowed");
        assertThat(reload(self).getRole()).isEqualTo(Role.ADMIN);
    }

    @Test
    void administratorsMayKeepTheirRoleAndRenameThemselves() {
        var self = seededAdminId();
        var name = reload(self).getFullName();

        var kept = patch(self, Map.of("role", "ADMIN"), admin(self));
        assertThat(kept).hasStatusOk();
        assertThat(read(kept, UserView.class)).extracting(UserView::fullName, UserView::role)
                .containsExactly(name, Role.ADMIN);

        var other = persist("Temporary Admin", email("admin"), Role.ADMIN, AccountStatus.ACTIVE);
        var renamed = patch(other.getId(), Map.of("fullName", "Renamed Admin", "role", "ADMIN"), admin(other.getId()));
        assertThat(renamed).hasStatusOk();
        assertThat(read(renamed, UserView.class).fullName()).isEqualTo("Renamed Admin");
    }

    @Test
    void demotesAnotherAdministratorWhileOthersRemain() {
        var other = persist("Second Admin", email("second-admin"), Role.ADMIN, AccountStatus.ACTIVE);

        var demoted = patch(other.getId(), Map.of("role", "USER"), admin());

        assertThat(demoted).hasStatusOk();
        assertThat(reload(other.getId()).getRole()).isEqualTo(Role.USER);
    }

    @ParameterizedTest
    @EnumSource(AccountStatus.class)
    void administratorsCannotChangeTheirOwnStatus(AccountStatus target) {
        var self = seededAdminId();

        var result = changeStatus(self, Map.of("status", target.name()), admin(self));

        assertProblem(result, HttpStatus.CONFLICT, "self-management", "Self management not allowed");
        assertThat(reload(self).getStatus()).isEqualTo(AccountStatus.ACTIVE);
    }

    @Test
    void administratorsCannotDeleteThemselves() {
        var self = seededAdminId();

        var result = mvc.delete().uri(USERS + "/{id}", self).with(admin(self)).exchange();

        assertProblem(result, HttpStatus.CONFLICT, "self-management", "Self management not allowed");
        assertThat(users.existsById(self)).isTrue();
    }

    @ParameterizedTest(name = "{0} -> {1}")
    @CsvSource({
        "PENDING,  ACTIVE",
        "PENDING,  DISABLED",
        "ACTIVE,   LOCKED",
        "ACTIVE,   DISABLED",
        "LOCKED,   ACTIVE",
        "LOCKED,   DISABLED",
        "DISABLED, ACTIVE",
        "PENDING,  PENDING",
        "ACTIVE,   ACTIVE",
        "LOCKED,   LOCKED",
        "DISABLED, DISABLED"
    })
    void appliesAllowedStatusTransitions(AccountStatus from, AccountStatus to) {
        var user = persist("Status Subject", email("status"), Role.USER, from);

        var result = changeStatus(user.getId(), Map.of("status", to.name()), admin());

        assertThat(result).hasStatusOk();
        assertThat(read(result, UserView.class).status()).isEqualTo(to);
        assertThat(reload(user.getId()).getStatus()).isEqualTo(to);
    }

    @ParameterizedTest(name = "{0} -> {1}")
    @CsvSource({
        "PENDING,  LOCKED",
        "ACTIVE,   PENDING",
        "LOCKED,   PENDING",
        "DISABLED, PENDING",
        "DISABLED, LOCKED"
    })
    void rejectsIllegalStatusTransitions(AccountStatus from, AccountStatus to) {
        var user = persist("Status Subject", email("illegal"), Role.USER, from);

        var result = changeStatus(user.getId(), Map.of("status", to.name()), admin());

        assertProblem(result, HttpStatus.CONFLICT, "illegal-transition", "Illegal status transition");
        assertThat(result).bodyJson().extractingPath("$.detail").isEqualTo("An account cannot move from %s to %s"
                .formatted(from.name().toLowerCase(Locale.ROOT), to.name().toLowerCase(Locale.ROOT)));
        assertThat(reload(user.getId()).getStatus()).isEqualTo(from);
    }

    @ParameterizedTest
    @ValueSource(strings = {"{}", "{\"status\":null}", "{\"status\":\"FROZEN\"}", "{\"status\":\"active\"}"})
    void rejectsMalformedStatusChanges(String request) {
        var user = persist("Status Subject", email("malformed"), Role.USER, AccountStatus.ACTIVE);

        var result = mvc.put().uri(USERS + "/{id}/status", user.getId()).with(admin())
                .contentType(MediaType.APPLICATION_JSON).content(request).exchange();

        assertThat(result).hasStatus(HttpStatus.BAD_REQUEST);
        assertThat(reload(user.getId()).getStatus()).isEqualTo(AccountStatus.ACTIVE);
    }

    @Test
    void statusChangesOfUnknownAccountsAreNotFound() {
        assertProblem(changeStatus(Long.MAX_VALUE - 1, Map.of("status", "LOCKED"), admin()), HttpStatus.NOT_FOUND,
                "not-found", "Resource not found");
    }

    @Test
    void lockingAnAccountRevokesOnlyItsRefreshTokens(CapturedOutput output) {
        var victim = createViaApi("Locked Out", email("victim"), Role.USER);
        var bystander = createViaApi("Bystander", email("bystander"), Role.USER);
        var victimRefresh = refreshTokenOf(victim.email());
        var bystanderRefresh = refreshTokenOf(bystander.email());

        assertThat(changeStatus(victim.id(), Map.of("status", "LOCKED"), admin())).hasStatusOk();

        assertThat(output.getOut()).contains("moved user %d from ACTIVE to LOCKED (1 refresh tokens revoked)"
                .formatted(victim.id()));
        assertProblem(refresh(victimRefresh), HttpStatus.BAD_REQUEST, "invalid-token", "Invalid or expired token");
        assertProblem(login(victim.email()), HttpStatus.FORBIDDEN, "account-unavailable", "Account unavailable");
        assertThat(refresh(bystanderRefresh)).hasStatusOk();

        assertThat(changeStatus(victim.id(), Map.of("status", "ACTIVE"), admin())).hasStatusOk();
        assertThat(output.getOut()).contains("moved user %d from LOCKED to ACTIVE (0 refresh tokens revoked)"
                .formatted(victim.id()));
        assertThat(login(victim.email())).hasStatusOk();
    }

    @Test
    void disablingAnAccountRevokesItsRefreshTokens() {
        var user = createViaApi("Disabled Soon", email("disable"), Role.USER);
        var refreshToken = refreshTokenOf(user.email());

        assertThat(changeStatus(user.id(), Map.of("status", "DISABLED"), admin())).hasStatusOk();

        assertProblem(refresh(refreshToken), HttpStatus.BAD_REQUEST, "invalid-token", "Invalid or expired token");
    }

    @Test
    void deleteRemovesTheAccountAndItsSessions(CapturedOutput output) {
        var user = createViaApi("Short Lived", email("delete"), Role.USER);
        var refreshToken = refreshTokenOf(user.email());

        var deleted = mvc.delete().uri(USERS + "/{id}", user.id()).with(admin()).exchange();

        assertThat(deleted).hasStatus(HttpStatus.NO_CONTENT);
        assertThat(output.getOut()).contains("deleted user %d".formatted(user.id()));
        assertThat(deleted.getResponse().getContentAsByteArray()).isEmpty();
        assertThat(users.existsById(user.id())).isFalse();
        assertProblem(mvc.get().uri(USERS + "/{id}", user.id()).with(admin()).exchange(), HttpStatus.NOT_FOUND,
                "not-found", "Resource not found");
        assertProblem(mvc.delete().uri(USERS + "/{id}", user.id()).with(admin()).exchange(), HttpStatus.NOT_FOUND,
                "not-found", "Resource not found");
        assertProblem(refresh(refreshToken), HttpStatus.BAD_REQUEST, "invalid-token", "Invalid or expired token");
        assertProblem(login(user.email()), HttpStatus.UNAUTHORIZED, "invalid-credentials", "Invalid credentials");
    }

    @Test
    void deleteAlsoRemovesAccountsWithPendingVerificationTokens() {
        var email = email("pending");
        var registered = mvc.post().uri("/api/v1/auth/register").contentType(MediaType.APPLICATION_JSON)
                .content(json.writeValueAsString(Map.of("fullName", "Pending Registrant", "email", email,
                        "password", PASSWORD)))
                .exchange();
        assertThat(registered).hasStatus(HttpStatus.CREATED);
        var pending = read(registered, UserView.class);
        assertThat(pending.status()).isEqualTo(AccountStatus.PENDING);

        assertThat(mvc.delete().uri(USERS + "/{id}", pending.id()).with(admin())).hasStatus(HttpStatus.NO_CONTENT);

        assertThat(users.existsByEmail(email)).isFalse();
    }

    @ParameterizedTest(name = "{0} {1}")
    @CsvSource({
        "GET,    /api/v1/users",
        "GET,    /api/v1/users/stats",
        "GET,    /api/v1/users/1",
        "POST,   /api/v1/users",
        "PATCH,  /api/v1/users/1",
        "PUT,    /api/v1/users/1/status",
        "DELETE, /api/v1/users/1"
    })
    void onlyAdministratorsReachTheUserApi(HttpMethod method, String path) {
        var ada = users.findByEmail("ada@portfolio.local").orElseThrow().getId();

        assertThat(mvc.method(method).uri(path).with(user(ada))).hasStatus(HttpStatus.FORBIDDEN);
        assertThat(mvc.method(method).uri(path)).hasStatus(HttpStatus.UNAUTHORIZED);
    }

    private User persist(String fullName, String email, Role role, AccountStatus status) {
        return users.save(User.register(fullName, email, "{bcrypt}unused", role, status));
    }

    private User reload(long id) {
        return users.findById(id).orElseThrow();
    }

    private long seededAdminId() {
        return users.findByEmail(SEEDED_ADMIN).orElseThrow().getId();
    }

    private String email(String local) {
        return local + "." + marker + "@example.test";
    }

    private static String unrelatedEmail() {
        return "user." + UUID.randomUUID() + "@example.test";
    }

    private static Map<String, @Nullable Object> body(String fullName, String email, String password, String role) {
        var body = new HashMap<String, @Nullable Object>();
        body.put("fullName", fullName);
        body.put("email", email);
        body.put("password", password);
        body.put("role", role);
        return body;
    }

    private MvcTestResult create(Map<String, ?> body) {
        return mvc.post().uri(USERS).with(admin()).contentType(MediaType.APPLICATION_JSON)
                .content(json.writeValueAsString(body)).exchange();
    }

    private UserView createViaApi(String fullName, String email, Role role) {
        var result = create(body(fullName, email, PASSWORD, role.name()));
        assertThat(result).hasStatus(HttpStatus.CREATED);
        return read(result, UserView.class);
    }

    private MvcTestResult patch(long id, Map<String, ?> body, RequestPostProcessor actor) {
        return mvc.patch().uri(USERS + "/{id}", id).with(actor).contentType(MediaType.APPLICATION_JSON)
                .content(json.writeValueAsString(body)).exchange();
    }

    private MvcTestResult changeStatus(long id, Map<String, ?> body, RequestPostProcessor actor) {
        return mvc.put().uri(USERS + "/{id}/status", id).with(actor).contentType(MediaType.APPLICATION_JSON)
                .content(json.writeValueAsString(body)).exchange();
    }

    private PageBody page(String query, Object... variables) {
        var result = mvc.get().uri(USERS + query, variables).with(admin()).exchange();
        assertThat(result).hasStatusOk();
        return read(result, PageBody.class);
    }

    private UserStats stats() {
        var result = mvc.get().uri(USERS + "/stats").with(admin()).exchange();
        assertThat(result).hasStatusOk();
        return read(result, UserStats.class);
    }

    private MvcTestResult login(String email) {
        return mvc.post().uri("/api/v1/auth/login").contentType(MediaType.APPLICATION_JSON)
                .content(json.writeValueAsString(Map.of("email", email, "password", PASSWORD))).exchange();
    }

    private String refreshTokenOf(String email) {
        var result = login(email);
        assertThat(result).hasStatusOk();
        return json.readTree(result.getResponse().getContentAsByteArray()).get("refreshToken").asString();
    }

    private MvcTestResult refresh(String refreshToken) {
        return mvc.post().uri("/api/v1/auth/refresh").contentType(MediaType.APPLICATION_JSON)
                .content(json.writeValueAsString(Map.of("refreshToken", refreshToken))).exchange();
    }

    private <T> T read(MvcTestResult result, Class<T> type) {
        return json.readValue(result.getResponse().getContentAsByteArray(), type);
    }

    private static List<String> emails(PageBody page) {
        return page.content().stream().map(UserView::email).toList();
    }

    private static long sum(Map<?, Long> counts) {
        return counts.values().stream().mapToLong(Long::longValue).sum();
    }

    private static <K> Map<K, Long> delta(Map<K, Long> before, Map<K, Long> after) {
        var delta = new HashMap<K, Long>();
        after.forEach((key, count) -> delta.put(key, count - before.getOrDefault(key, 0L)));
        return delta;
    }

    private static void assertProblem(MvcTestResult result, HttpStatus status, String type, String title) {
        assertThat(result).hasStatus(status).hasContentTypeCompatibleWith(MediaType.APPLICATION_PROBLEM_JSON);
        assertThat(result).bodyJson().extractingPath("$.type").isEqualTo("urn:problem:" + type);
        assertThat(result).bodyJson().extractingPath("$.title").isEqualTo(title);
        assertThat(result).bodyJson().extractingPath("$.status").isEqualTo(status.value());
    }

    record PageBody(List<UserView> content, PageMeta page) {}

    record PageMeta(int size, int number, long totalElements, int totalPages) {}
}
