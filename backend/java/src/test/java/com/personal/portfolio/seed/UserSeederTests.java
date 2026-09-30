package com.personal.portfolio.seed;

import static org.assertj.core.api.Assertions.assertThat;

import com.personal.portfolio.support.IntegrationTest;
import com.personal.portfolio.user.AccountStatus;
import com.personal.portfolio.user.Role;
import com.personal.portfolio.user.UserRepository;
import java.util.List;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.junit.jupiter.params.ParameterizedTest;
import org.junit.jupiter.params.provider.CsvSource;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.DefaultApplicationArguments;
import org.springframework.boot.test.system.CapturedOutput;
import org.springframework.boot.test.system.OutputCaptureExtension;
import org.springframework.security.crypto.password.PasswordEncoder;

@ExtendWith(OutputCaptureExtension.class)
class UserSeederTests extends IntegrationTest {

    private static final List<String> SEEDED = List.of("admin@test.local", "ada@portfolio.local", "alan@portfolio.local");

    @Autowired
    private UserSeeder seeder;

    @Autowired
    private UserRepository users;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @ParameterizedTest(name = "{0}")
    @CsvSource({
            "admin@test.local, Khova Krishna Pilato, ADMIN, Admin-Passw0rd",
            "ada@portfolio.local, Ada Lovelace, USER, Demo-Passw0rd",
            "alan@portfolio.local, Alan Turing, USER, Demo-Passw0rd"})
    void seedsActiveAccountsWithTheConfiguredPasswords(String email, String fullName, Role role, String password) {
        var user = users.findByEmail(email).orElseThrow();

        assertThat(user.getFullName()).isEqualTo(fullName);
        assertThat(user.getRole()).isEqualTo(role);
        assertThat(user.getStatus()).isEqualTo(AccountStatus.ACTIVE);
        assertThat(user.getPasswordHash()).startsWith("{bcrypt}").doesNotContain(password);
        assertThat(passwordEncoder.matches(password, user.getPasswordHash())).isTrue();
    }

    @Test
    void createsNoDuplicatesWhenRunAgain(CapturedOutput output) throws Exception {
        var before = users.count();
        var ids = SEEDED.stream().map(email -> users.findByEmail(email).orElseThrow().getId()).toList();

        seeder.run(new DefaultApplicationArguments());

        assertThat(users.count()).isEqualTo(before);
        assertThat(SEEDED.stream().map(email -> users.findByEmail(email).orElseThrow().getId()).toList())
                .isEqualTo(ids);
        assertThat(output.getOut()).contains("Seeded 0 of 3 users");
    }
}
