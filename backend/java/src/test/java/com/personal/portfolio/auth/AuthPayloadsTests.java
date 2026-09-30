package com.personal.portfolio.auth;

import static org.assertj.core.api.Assertions.assertThat;
import static org.junit.jupiter.params.provider.Arguments.arguments;

import com.personal.portfolio.auth.AuthPayloads.Credentials;
import com.personal.portfolio.auth.AuthPayloads.PasswordChange;
import com.personal.portfolio.auth.AuthPayloads.PasswordReset;
import com.personal.portfolio.auth.AuthPayloads.RefreshRequest;
import com.personal.portfolio.auth.AuthPayloads.Registration;
import com.personal.portfolio.auth.AuthPayloads.TokenPair;
import com.personal.portfolio.auth.AuthPayloads.TokenRequest;
import java.time.Instant;
import java.util.stream.Stream;
import org.junit.jupiter.params.ParameterizedTest;
import org.junit.jupiter.params.provider.Arguments;
import org.junit.jupiter.params.provider.MethodSource;

class AuthPayloadsTests {

    private static final String SECRET = "S3cret-Value-42";
    private static final String OTHER_SECRET = "0ther-Secret-Value";

    @ParameterizedTest
    @MethodSource("secretBearingPayloads")
    void redactsSecretsFromTheStringForm(Record payload, String visible) {
        assertThat(payload.toString())
                .doesNotContain(SECRET)
                .doesNotContain(OTHER_SECRET)
                .contains("<redacted>")
                .contains(visible);
    }

    static Stream<Arguments> secretBearingPayloads() {
        return Stream.of(
                arguments(new Registration("Ada Lovelace", "ada@example.test", SECRET), "ada@example.test"),
                arguments(new Credentials("ada@example.test", SECRET), "ada@example.test"),
                arguments(new TokenRequest(SECRET), "TokenRequest"),
                arguments(new RefreshRequest(SECRET), "RefreshRequest"),
                arguments(new PasswordReset(SECRET, OTHER_SECRET), "PasswordReset"),
                arguments(new PasswordChange(SECRET, OTHER_SECRET), "PasswordChange"),
                arguments(new TokenPair("Bearer", SECRET, Instant.EPOCH, 900, OTHER_SECRET, Instant.EPOCH),
                        "expiresIn=900"));
    }
}
