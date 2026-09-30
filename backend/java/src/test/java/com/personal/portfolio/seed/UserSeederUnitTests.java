package com.personal.portfolio.seed;

import static java.nio.charset.StandardCharsets.UTF_8;
import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatExceptionOfType;
import static org.assertj.core.api.Assertions.assertThatIllegalArgumentException;
import static org.assertj.core.api.Assertions.assertThatIllegalStateException;
import static org.assertj.core.api.Assertions.tuple;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.BDDMockito.given;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;

import com.personal.portfolio.platform.AppProperties;
import com.personal.portfolio.support.AppPropertiesFixture;
import com.personal.portfolio.user.AccountStatus;
import com.personal.portfolio.user.Role;
import com.personal.portfolio.user.User;
import com.personal.portfolio.user.UserRepository;
import jakarta.validation.Validation;
import jakarta.validation.Validator;
import jakarta.validation.ValidatorFactory;
import java.io.FileNotFoundException;
import org.junit.jupiter.api.AfterAll;
import org.junit.jupiter.api.Test;
import org.mockito.ArgumentCaptor;
import org.springframework.boot.DefaultApplicationArguments;
import org.springframework.boot.test.context.runner.ApplicationContextRunner;
import org.springframework.core.io.ByteArrayResource;
import org.springframework.core.io.ClassPathResource;
import org.springframework.core.io.Resource;
import org.springframework.mock.env.MockEnvironment;
import org.springframework.security.crypto.factory.PasswordEncoderFactories;
import org.springframework.security.crypto.password.PasswordEncoder;
import tools.jackson.databind.json.JsonMapper;

class UserSeederUnitTests {

    private static final String SEED_FILE = """
            [
              {"fullName": " ${SEED_NAME} ", "email": " ${SEED_EMAIL} ", "role": "ADMIN", "password": "${SEED_PASSWORD}"},
              {"fullName": "Grace Duplicate", "email": "GRACE@example.test", "role": "USER", "password": "Other-Passw0rd"},
              {"fullName": "Existing Person", "email": "existing@example.test", "role": "USER", "password": "Old-Passw0rd"},
              {"fullName": "Linus Torvalds", "email": "linus@example.test", "role": "USER", "password": "Linus-Passw0rd"}
            ]
            """;

    private static final ValidatorFactory VALIDATION = Validation.buildDefaultValidatorFactory();

    private final UserRepository users = mock(UserRepository.class);
    private final PasswordEncoder passwordEncoder = PasswordEncoderFactories.createDelegatingPasswordEncoder();
    private final MockEnvironment environment = new MockEnvironment()
            .withProperty("SEED_NAME", "Grace Hopper")
            .withProperty("SEED_EMAIL", "Grace@Example.TEST")
            .withProperty("SEED_PASSWORD", "Grace-Passw0rd");

    @AfterAll
    static void closeValidation() {
        VALIDATION.close();
    }

    @Test
    void registersEveryNewDistinctAccountAsActive() throws Exception {
        given(users.existsByEmail("existing@example.test")).willReturn(true);

        seeder(SEED_FILE).run(new DefaultApplicationArguments());

        ArgumentCaptor<Iterable<User>> saved = ArgumentCaptor.captor();
        verify(users).saveAll(saved.capture());
        assertThat(saved.getValue())
                .extracting(User::getEmail, User::getFullName, User::getRole, User::getStatus)
                .containsExactly(
                        tuple("grace@example.test", "Grace Hopper", Role.ADMIN, AccountStatus.ACTIVE),
                        tuple("linus@example.test", "Linus Torvalds", Role.USER, AccountStatus.ACTIVE));
        assertThat(saved.getValue()).satisfiesExactly(
                grace -> assertThat(passwordEncoder.matches("Grace-Passw0rd", grace.getPasswordHash())).isTrue(),
                linus -> assertThat(passwordEncoder.matches("Linus-Passw0rd", linus.getPasswordHash())).isTrue());
    }

    @Test
    void savesNothingNewWhenEveryAccountExists() throws Exception {
        given(users.existsByEmail(anyString())).willReturn(true);

        seeder(SEED_FILE).run(new DefaultApplicationArguments());

        ArgumentCaptor<Iterable<User>> saved = ArgumentCaptor.captor();
        verify(users).saveAll(saved.capture());
        assertThat(saved.getValue()).isEmpty();
    }

    @Test
    void failsFastWhenAPlaceholderCannotBeResolved() {
        var seeder = seeder("""
                [{"fullName": "Nobody", "email": "${SEED_MISSING_EMAIL}", "role": "USER", "password": "x"}]
                """);

        assertThatIllegalArgumentException()
                .isThrownBy(() -> seeder.run(new DefaultApplicationArguments()))
                .withMessageContaining("SEED_MISSING_EMAIL");
        verify(users, never()).saveAll(any());
    }

    @Test
    void refusesToSeedPasswordsThatViolateThePolicy() {
        var seeder = seeder("""
                [{"fullName": "Weak", "email": "weak@example.test", "role": "ADMIN", "password": "change-me"}]
                """);

        assertThatIllegalStateException()
                .isThrownBy(() -> seeder.run(new DefaultApplicationArguments()))
                .withMessage("Seed password for weak@example.test does not satisfy the password policy")
                .withMessageNotContaining("change-me");
        verify(users, never()).saveAll(any());
    }

    @Test
    void failsWhenTheSeedFileIsMissing() {
        var seeder = seeder(new ClassPathResource("seed/does-not-exist.json"));

        assertThatExceptionOfType(FileNotFoundException.class)
                .isThrownBy(() -> seeder.run(new DefaultApplicationArguments()));
        verify(users, never()).saveAll(any());
    }

    @Test
    void neverPrintsTheSeedPassword() {
        var seed = new UserSeeder.SeedUser("Grace Hopper", "grace@example.test", Role.ADMIN, "Grace-Passw0rd");

        assertThat(seed.toString())
                .isEqualTo("SeedUser[fullName=Grace Hopper, email=grace@example.test, role=ADMIN, password=<redacted>]")
                .doesNotContain("Grace-Passw0rd");
    }

    @Test
    void registersOnlyWhenSeedingIsEnabled() {
        var runner = new ApplicationContextRunner()
                .withBean(AppProperties.class,
                        () -> AppPropertiesFixture.withSeed(new ByteArrayResource(SEED_FILE.getBytes(UTF_8))))
                .withBean(JsonMapper.class, () -> JsonMapper.builder().build())
                .withBean(UserRepository.class, () -> users)
                .withBean(PasswordEncoder.class, () -> passwordEncoder)
                .withBean(Validator.class, VALIDATION::getValidator)
                .withUserConfiguration(UserSeeder.class);

        runner.run(context -> assertThat(context).doesNotHaveBean(UserSeeder.class));
        runner.withPropertyValues("app.seed.enabled=false")
                .run(context -> assertThat(context).doesNotHaveBean(UserSeeder.class));
        runner.withPropertyValues("app.seed.enabled=true")
                .run(context -> assertThat(context).hasSingleBean(UserSeeder.class));
    }

    private UserSeeder seeder(String json) {
        return seeder(new ByteArrayResource(json.getBytes(UTF_8)));
    }

    private UserSeeder seeder(Resource seedFile) {
        return new UserSeeder(AppPropertiesFixture.withSeed(seedFile), JsonMapper.builder().build(), environment, users,
                passwordEncoder, VALIDATION.getValidator());
    }
}
