package com.personal.portfolio.user;

import static org.assertj.core.api.Assertions.assertThat;

import java.util.Arrays;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.params.ParameterizedTest;
import org.junit.jupiter.params.provider.CsvSource;
import org.junit.jupiter.params.provider.EnumSource.Mode;
import org.junit.jupiter.params.provider.EnumSource;

class AccountStatusTests {

    @ParameterizedTest(name = "{0} -> {1} allowed: {2}")
    @CsvSource({
        "PENDING,  PENDING,  false",
        "PENDING,  ACTIVE,   true",
        "PENDING,  LOCKED,   false",
        "PENDING,  DISABLED, true",
        "ACTIVE,   PENDING,  false",
        "ACTIVE,   ACTIVE,   false",
        "ACTIVE,   LOCKED,   true",
        "ACTIVE,   DISABLED, true",
        "LOCKED,   PENDING,  false",
        "LOCKED,   ACTIVE,   true",
        "LOCKED,   LOCKED,   false",
        "LOCKED,   DISABLED, true",
        "DISABLED, PENDING,  false",
        "DISABLED, ACTIVE,   true",
        "DISABLED, LOCKED,   false",
        "DISABLED, DISABLED, false"
    })
    void followsTheAccountStateMachine(AccountStatus from, AccountStatus to, boolean allowed) {
        assertThat(from.canTransitionTo(to)).isEqualTo(allowed);
    }

    @Test
    void declaresTheLifecycleInOrder() {
        assertThat(AccountStatus.values()).containsExactly(
                AccountStatus.PENDING, AccountStatus.ACTIVE, AccountStatus.LOCKED, AccountStatus.DISABLED);
    }

    @ParameterizedTest
    @EnumSource(AccountStatus.class)
    void noAccountEverReturnsToPending(AccountStatus from) {
        assertThat(from.canTransitionTo(AccountStatus.PENDING)).isFalse();
    }

    @ParameterizedTest
    @EnumSource(value = AccountStatus.class, mode = Mode.EXCLUDE, names = "ACTIVE")
    void everyInactiveAccountCanBeActivated(AccountStatus from) {
        assertThat(from.canTransitionTo(AccountStatus.ACTIVE)).isTrue();
    }

    @ParameterizedTest
    @EnumSource(value = AccountStatus.class, mode = Mode.EXCLUDE, names = "DISABLED")
    void everyEnabledAccountCanBeDisabled(AccountStatus from) {
        assertThat(from.canTransitionTo(AccountStatus.DISABLED)).isTrue();
    }

    @Test
    void onlyActiveAccountsCanBeLocked() {
        assertThat(Arrays.stream(AccountStatus.values()).filter(status -> status.canTransitionTo(AccountStatus.LOCKED)))
                .containsExactly(AccountStatus.ACTIVE);
    }
}
