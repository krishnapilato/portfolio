package com.personal.portfolio.user;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;

import com.personal.portfolio.platform.ApiException;
import com.personal.portfolio.platform.Problem.IllegalTransition;
import java.time.Duration;
import java.time.Instant;
import java.util.Arrays;
import java.util.Locale;
import java.util.stream.Stream;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.params.ParameterizedTest;
import org.junit.jupiter.params.provider.Arguments;
import org.junit.jupiter.params.provider.EnumSource.Mode;
import org.junit.jupiter.params.provider.EnumSource;
import org.junit.jupiter.params.provider.MethodSource;
import org.junit.jupiter.params.provider.ValueSource;

class UserTests {

    private static final Instant NOW = Instant.parse("2026-09-30T08:00:00Z");
    private static final Duration LOCKOUT = Duration.ofMinutes(15);
    private static final int MAX_ATTEMPTS = 5;

    @Test
    void registerStripsTheNameAndNormalizesTheEmail() {
        var user = User.register("  Ada Lovelace \t", "  Ada.Lovelace@Example.TEST ", "{bcrypt}hash", Role.ADMIN,
                AccountStatus.PENDING);

        assertThat(user.getId()).isZero();
        assertThat(user.getVersion()).isZero();
        assertThat(user.getFullName()).isEqualTo("Ada Lovelace");
        assertThat(user.getEmail()).isEqualTo("ada.lovelace@example.test");
        assertThat(user.getPasswordHash()).isEqualTo("{bcrypt}hash");
        assertThat(user.getRole()).isEqualTo(Role.ADMIN);
        assertThat(user.getStatus()).isEqualTo(AccountStatus.PENDING);
        assertThat(user.getFailedLogins()).isZero();
        assertThat(user.getLockedUntil()).isNull();
        assertThat(user.getLastLoginAt()).isNull();
        assertThat(user.isLockedOut(NOW)).isFalse();
    }

    @ParameterizedTest(name = "\"{0}\" -> {1}")
    @MethodSource("emails")
    void normalizeEmailStripsWhitespaceAndLowerCases(String raw, String normalized) {
        assertThat(User.normalizeEmail(raw)).isEqualTo(normalized);
    }

    static Stream<Arguments> emails() {
        return Stream.of(
                Arguments.of("ada@example.test", "ada@example.test"),
                Arguments.of("ADA@EXAMPLE.TEST", "ada@example.test"),
                Arguments.of("  Grace.Hopper@Navy.MIL  ", "grace.hopper@navy.mil"),
                Arguments.of("\tAlan@Bletchley.Park\n", "alan@bletchley.park"),
                Arguments.of(" Edsger@Example.Test ", "edsger@example.test"));
    }

    @Test
    void normalizeEmailIgnoresTheDefaultLocale() {
        var original = Locale.getDefault();
        try {
            Locale.setDefault(Locale.forLanguageTag("tr-TR"));
            assertThat(User.normalizeEmail("INFO@ISTANBUL.TEST")).isEqualTo("info@istanbul.test");
        } finally {
            Locale.setDefault(original);
        }
    }

    @Test
    void verifyEmailActivatesAPendingAccount() {
        var user = user(AccountStatus.PENDING);

        user.verifyEmail();

        assertThat(user.getStatus()).isEqualTo(AccountStatus.ACTIVE);
    }

    @ParameterizedTest
    @EnumSource(value = AccountStatus.class, mode = Mode.EXCLUDE, names = "PENDING")
    void verifyEmailLeavesOtherStatusesUntouched(AccountStatus status) {
        var user = user(status);

        user.verifyEmail();

        assertThat(user.getStatus()).isEqualTo(status);
    }

    @Test
    void failedLoginsBelowTheThresholdAreOnlyCounted() {
        var user = user(AccountStatus.ACTIVE);

        failLogins(user, MAX_ATTEMPTS - 1, NOW);

        assertThat(user.getFailedLogins()).isEqualTo(MAX_ATTEMPTS - 1);
        assertThat(user.getLockedUntil()).isNull();
        assertThat(user.isLockedOut(NOW)).isFalse();
    }

    @ParameterizedTest
    @ValueSource(ints = {1, 3, 5})
    void reachingTheThresholdLocksTheAccountAndResetsTheCounter(int maxAttempts) {
        var user = user(AccountStatus.ACTIVE);
        failLogins(user, maxAttempts - 1, NOW.minusSeconds(30));

        user.recordFailedLogin(NOW, maxAttempts, LOCKOUT);

        assertThat(user.getLockedUntil()).isEqualTo(NOW.plus(LOCKOUT));
        assertThat(user.getFailedLogins()).isZero();
        assertThat(user.isLockedOut(NOW)).isTrue();
        assertThat(user.getStatus()).isEqualTo(AccountStatus.ACTIVE);
    }

    @Test
    void lockoutExpiresExactlyAtLockedUntil() {
        var user = user(AccountStatus.ACTIVE);
        failLogins(user, MAX_ATTEMPTS, NOW);
        var until = NOW.plus(LOCKOUT);

        assertThat(user.isLockedOut(NOW.minusSeconds(1))).isTrue();
        assertThat(user.isLockedOut(until.minusNanos(1))).isTrue();
        assertThat(user.isLockedOut(until)).isFalse();
        assertThat(user.isLockedOut(until.plusSeconds(1))).isFalse();
    }

    @Test
    void countingStartsOverAfterALockout() {
        var user = user(AccountStatus.ACTIVE);
        failLogins(user, MAX_ATTEMPTS, NOW);
        var later = NOW.plus(LOCKOUT).plusSeconds(60);

        user.recordFailedLogin(later, MAX_ATTEMPTS, LOCKOUT);

        assertThat(user.getFailedLogins()).isEqualTo(1);
        assertThat(user.getLockedUntil()).isEqualTo(NOW.plus(LOCKOUT));
        assertThat(user.isLockedOut(later)).isFalse();

        failLogins(user, MAX_ATTEMPTS - 1, later);

        assertThat(user.getLockedUntil()).isEqualTo(later.plus(LOCKOUT));
        assertThat(user.isLockedOut(later)).isTrue();
    }

    @Test
    void successfulLoginClearsTheLockoutAndRecordsTheTime() {
        var user = user(AccountStatus.ACTIVE);
        failLogins(user, MAX_ATTEMPTS, NOW);
        failLogins(user, 2, NOW);
        var later = NOW.plus(LOCKOUT);

        user.recordSuccessfulLogin(later);

        assertThat(user.getFailedLogins()).isZero();
        assertThat(user.getLockedUntil()).isNull();
        assertThat(user.getLastLoginAt()).isEqualTo(later);
        assertThat(user.isLockedOut(NOW)).isFalse();
    }

    @ParameterizedTest(name = "{0} -> {1}")
    @MethodSource("everyTransition")
    void transitionToHonoursTheStateMachine(AccountStatus from, AccountStatus to) {
        var user = user(from);

        if (from == to || from.canTransitionTo(to)) {
            user.transitionTo(to);
            assertThat(user.getStatus()).isEqualTo(to);
        } else {
            assertThatThrownBy(() -> user.transitionTo(to))
                    .isInstanceOfSatisfying(ApiException.class,
                            failure -> assertThat(failure.problem()).isEqualTo(new IllegalTransition(from, to)));
            assertThat(user.getStatus()).isEqualTo(from);
        }
    }

    static Stream<Arguments> everyTransition() {
        return Arrays.stream(AccountStatus.values())
                .flatMap(from -> Arrays.stream(AccountStatus.values()).map(to -> Arguments.of(from, to)));
    }

    @ParameterizedTest
    @EnumSource(value = AccountStatus.class, mode = Mode.EXCLUDE, names = "ACTIVE")
    void activatingClearsTheLockout(AccountStatus from) {
        var user = user(from);
        failLogins(user, MAX_ATTEMPTS, NOW);
        failLogins(user, 2, NOW);

        user.transitionTo(AccountStatus.ACTIVE);

        assertThat(user.getStatus()).isEqualTo(AccountStatus.ACTIVE);
        assertThat(user.getFailedLogins()).isZero();
        assertThat(user.getLockedUntil()).isNull();
        assertThat(user.isLockedOut(NOW)).isFalse();
    }

    @ParameterizedTest
    @EnumSource(value = AccountStatus.class, names = {"LOCKED", "DISABLED"})
    void leavingActiveKeepsTheLockoutState(AccountStatus target) {
        var user = user(AccountStatus.ACTIVE);
        failLogins(user, MAX_ATTEMPTS, NOW);
        failLogins(user, 2, NOW);

        user.transitionTo(target);

        assertThat(user.getStatus()).isEqualTo(target);
        assertThat(user.getFailedLogins()).isEqualTo(2);
        assertThat(user.getLockedUntil()).isEqualTo(NOW.plus(LOCKOUT));
    }

    @Test
    void stayingActiveIsANoOpThatKeepsTheLockout() {
        var user = user(AccountStatus.ACTIVE);
        failLogins(user, MAX_ATTEMPTS, NOW);

        user.transitionTo(AccountStatus.ACTIVE);

        assertThat(user.getLockedUntil()).isEqualTo(NOW.plus(LOCKOUT));
        assertThat(user.isLockedOut(NOW)).isTrue();
    }

    @Test
    void renameStripsSurroundingWhitespace() {
        var user = user(AccountStatus.ACTIVE);

        user.rename("\t Rear Admiral Grace Hopper  ");

        assertThat(user.getFullName()).isEqualTo("Rear Admiral Grace Hopper");
    }

    @Test
    void assignRoleReplacesTheRole() {
        var user = user(AccountStatus.ACTIVE);

        user.assignRole(Role.ADMIN);
        assertThat(user.getRole()).isEqualTo(Role.ADMIN);

        user.assignRole(Role.USER);
        assertThat(user.getRole()).isEqualTo(Role.USER);
    }

    @Test
    void changePasswordReplacesTheHashClearsTheLockoutAndEndsSessions() {
        var user = user(AccountStatus.ACTIVE);
        failLogins(user, MAX_ATTEMPTS, NOW);
        failLogins(user, 2, NOW);

        user.changePassword("{bcrypt}new-hash");

        assertThat(user.getPasswordHash()).isEqualTo("{bcrypt}new-hash");
        assertThat(user.getFailedLogins()).isZero();
        assertThat(user.getLockedUntil()).isNull();
        assertThat(user.isLockedOut(NOW)).isFalse();
        assertThat(user.getEmail()).isEqualTo("grace@example.test");
        assertThat(user.getStatus()).isEqualTo(AccountStatus.ACTIVE);
        assertThat(user.getSessionVersion()).isEqualTo(1);
        assertThat(user.acceptsTokenOfSession(0)).isFalse();
        assertThat(user.acceptsTokenOfSession(1)).isTrue();
    }

    @Test
    void endingSessionsInvalidatesEveryTokenOfTheCurrentSession() {
        var user = user(AccountStatus.ACTIVE);
        assertThat(user.acceptsTokenOfSession(0)).isTrue();

        user.endSessions();
        user.endSessions();

        assertThat(user.getSessionVersion()).isEqualTo(2);
        assertThat(user.acceptsTokenOfSession(0)).isFalse();
        assertThat(user.acceptsTokenOfSession(1)).isFalse();
        assertThat(user.acceptsTokenOfSession(2)).isTrue();
    }

    @ParameterizedTest
    @EnumSource(value = AccountStatus.class, names = "ACTIVE", mode = Mode.EXCLUDE)
    void rejectsEveryTokenOfAnAccountThatIsNotActive(AccountStatus status) {
        assertThat(user(status).acceptsTokenOfSession(0)).isFalse();
    }

    @Test
    void upgradingTheHashKeepsSessionsAndFailedAttempts() {
        var user = user(AccountStatus.ACTIVE);
        failLogins(user, 2, NOW);

        user.upgradePasswordHash("{argon2}upgraded");

        assertThat(user.getPasswordHash()).isEqualTo("{argon2}upgraded");
        assertThat(user.getFailedLogins()).isEqualTo(2);
        assertThat(user.getSessionVersion()).isZero();
    }

    private static User user(AccountStatus status) {
        return User.register("Grace Hopper", "grace@example.test", "{bcrypt}hash", Role.USER, status);
    }

    private static void failLogins(User user, int times, Instant at) {
        for (var attempt = 0; attempt < times; attempt++) {
            user.recordFailedLogin(at, MAX_ATTEMPTS, LOCKOUT);
        }
    }
}
