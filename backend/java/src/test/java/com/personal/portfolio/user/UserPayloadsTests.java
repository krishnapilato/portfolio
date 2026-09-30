package com.personal.portfolio.user;

import static org.assertj.core.api.Assertions.assertThat;

import com.personal.portfolio.user.UserPayloads.CreateUser;
import com.personal.portfolio.user.UserPayloads.UserView;
import org.junit.jupiter.api.Test;

class UserPayloadsTests {

    @Test
    void createUserNeverPrintsThePassword() {
        var request = new CreateUser("Grace Hopper", "grace@example.test", "Str0ng-Passw0rd", Role.ADMIN);

        assertThat(request.toString())
                .isEqualTo("CreateUser[fullName=Grace Hopper, email=grace@example.test, password=<redacted>, role=ADMIN]")
                .doesNotContain(request.password());
    }

    @Test
    void userViewExposesOnlyPublicAccountData() {
        var user = User.register(" Grace Hopper ", "Grace@Example.TEST", "{bcrypt}secret", Role.USER, AccountStatus.PENDING);

        var view = UserView.of(user);

        assertThat(view.id()).isZero();
        assertThat(view.fullName()).isEqualTo("Grace Hopper");
        assertThat(view.email()).isEqualTo("grace@example.test");
        assertThat(view.role()).isEqualTo(Role.USER);
        assertThat(view.status()).isEqualTo(AccountStatus.PENDING);
        assertThat(view.lastLoginAt()).isNull();
        assertThat(view.toString()).doesNotContain("secret");
    }
}
