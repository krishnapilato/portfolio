package com.personal.portfolio.security;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.Mockito.mock;

import jakarta.validation.ConstraintValidatorContext;
import jakarta.validation.ConstraintViolation;
import jakarta.validation.Validation;
import jakarta.validation.Validator;
import jakarta.validation.ValidatorFactory;
import java.nio.charset.StandardCharsets;
import java.util.Set;
import java.util.stream.Stream;
import org.jspecify.annotations.Nullable;
import org.junit.jupiter.api.AfterAll;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.params.ParameterizedTest;
import org.junit.jupiter.params.provider.MethodSource;
import org.junit.jupiter.params.provider.ValueSource;

class StrongPasswordTests {

    private static final String MESSAGE =
            "must be 10-72 characters (at most 72 bytes) and contain upper-case, lower-case and a digit";
    private static final ValidatorFactory FACTORY = Validation.buildDefaultValidatorFactory();
    private static final Validator VALIDATOR = FACTORY.getValidator();

    @AfterAll
    static void closeValidation() {
        FACTORY.close();
    }

    @ParameterizedTest
    @ValueSource(strings = {"Passw0rd-1", "Correct-Horse-Battery-Staple-9", "aB3aB3aB3a", "Übel-Passw0rd"})
    void acceptsPasswordsWithMixedCaseAndADigit(String password) {
        assertThat(validate(password)).isEmpty();
    }

    @ParameterizedTest
    @MethodSource("weakPasswords")
    void rejectsWeakPasswordsWithASingleViolation(@Nullable String password) {
        assertThat(validate(password)).singleElement()
                .satisfies(violation -> assertThat(violation.getMessage()).isEqualTo(MESSAGE));
    }

    static Stream<@Nullable String> weakPasswords() {
        return Stream.of(null, "", "          ", "Sh0rt-pw", "Aa1Aa1Aa1", "all-lower-case-1", "ALL-UPPER-CASE-1",
                "No-Digits-Anywhere", "A1" + "a".repeat(71), "Aa1" + "é".repeat(35));
    }

    @ParameterizedTest
    @ValueSource(ints = {10, 72})
    void acceptsTheLengthBoundaries(int length) {
        assertThat(validate("Aa1" + "x".repeat(length - 3))).isEmpty();
    }

    @Test
    void acceptsMultibytePasswordsUpToBcryptsByteLimit() {
        var password = "Aa1" + "é".repeat(34) + "x";

        assertThat(password.getBytes(StandardCharsets.UTF_8)).hasSize(StrongPassword.BCRYPT_LIMIT);
        assertThat(validate(password)).isEmpty();
    }

    @Test
    void leavesMissingPasswordsToTheNotBlankConstraint() {
        assertThat(new StrongPassword.BcryptLimit().isValid(null, mock(ConstraintValidatorContext.class))).isTrue();
    }

    private static Set<ConstraintViolation<Candidate>> validate(@Nullable String password) {
        return VALIDATOR.validate(new Candidate(password));
    }

    record Candidate(@StrongPassword @Nullable String password) {}
}
