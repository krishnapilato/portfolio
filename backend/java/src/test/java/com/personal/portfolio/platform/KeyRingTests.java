package com.personal.portfolio.platform;

import static com.personal.portfolio.support.AppPropertiesFixture.secretOf;
import static com.personal.portfolio.support.AppPropertiesFixture.withSecret;
import static java.nio.charset.StandardCharsets.UTF_8;
import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;

import java.security.GeneralSecurityException;
import java.util.Arrays;
import java.util.HexFormat;
import java.util.stream.Stream;
import javax.crypto.Mac;
import javax.crypto.spec.SecretKeySpec;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.params.ParameterizedTest;
import org.junit.jupiter.params.provider.MethodSource;
import org.junit.jupiter.params.provider.ValueSource;

class KeyRingTests {

    private static final String HMAC = "HmacSHA256";
    private static final String SALT = "portfolio/key-ring/v1";
    private static final String SIGNING_INFO = "jwt/hs256";
    private static final String FINGERPRINT_INFO = "token/fingerprint";
    private static final String INVALID_SECRET = "APP_SECRET must be base64 encoding at least 32 random bytes";
    private static final byte[] MASTER = sequence(48, 0);
    private static final String SECRET = secretOf(MASTER);

    private final KeyRing keyRing = new KeyRing(withSecret(SECRET));

    @Test
    void derivesA256BitHmacSha256SigningKeyWithHkdf() {
        var key = keyRing.signingKey();

        assertThat(key.getAlgorithm()).isEqualTo(HMAC);
        assertThat(key.getEncoded()).hasSize(32).isEqualTo(hkdf(MASTER, SIGNING_INFO));
    }

    @ParameterizedTest
    @ValueSource(strings = {"opaque-token", "tökén-☃", ""})
    void fingerprintsWithAnHmacKeyDerivedForFingerprintsOnly(String token) {
        var expected = HexFormat.of().formatHex(hmac(hkdf(MASTER, FINGERPRINT_INFO), token.getBytes(UTF_8)));

        assertThat(keyRing.fingerprint(token)).isEqualTo(expected);
    }

    @Test
    void derivesIndependentKeysForEachPurpose() {
        var signing = keyRing.signingKey().getEncoded();

        assertThat(signing).isNotEqualTo(hkdf(MASTER, FINGERPRINT_INFO));
        assertThat(signing).isNotEqualTo(Arrays.copyOf(MASTER, signing.length));
        assertThat(keyRing.fingerprint("token"))
                .isNotEqualTo(HexFormat.of().formatHex(hmac(signing, "token".getBytes(UTF_8))))
                .isNotEqualTo(HexFormat.of().formatHex(hmac(MASTER, "token".getBytes(UTF_8))));
    }

    @Test
    void derivesTheSameKeysFromTheSameSecret() {
        var twin = new KeyRing(withSecret(SECRET));

        assertThat(twin.signingKey().getEncoded()).isEqualTo(keyRing.signingKey().getEncoded());
        assertThat(twin.fingerprint("refresh-token")).isEqualTo(keyRing.fingerprint("refresh-token"));
    }

    @Test
    void derivesDifferentKeysFromDifferentSecrets() {
        var other = new KeyRing(withSecret(secretOf(sequence(48, 1))));

        assertThat(other.signingKey().getEncoded()).isNotEqualTo(keyRing.signingKey().getEncoded());
        assertThat(other.fingerprint("refresh-token")).isNotEqualTo(keyRing.fingerprint("refresh-token"));
    }

    @Test
    void fingerprintsAreStableLowercaseHexDigests() {
        var fingerprint = keyRing.fingerprint("refresh-token");

        assertThat(fingerprint)
                .matches("[0-9a-f]{64}")
                .isEqualTo(keyRing.fingerprint("refresh-token"))
                .isNotEqualTo(keyRing.fingerprint("refresh-token-2"))
                .isNotEqualTo(keyRing.fingerprint("Refresh-token"));
    }

    @Test
    void ignoresWhitespaceAroundTheSecret() {
        var padded = new KeyRing(withSecret("  " + SECRET + "\n"));

        assertThat(padded.signingKey().getEncoded()).isEqualTo(keyRing.signingKey().getEncoded());
        assertThat(padded.fingerprint("token")).isEqualTo(keyRing.fingerprint("token"));
    }

    @Test
    void acceptsASecretOfExactlyThirtyTwoBytesAndDistinguishesLongerOnes() {
        var minimal = sequence(32, 0);

        assertThat(new KeyRing(withSecret(secretOf(minimal))).signingKey().getEncoded())
                .isEqualTo(hkdf(minimal, SIGNING_INFO))
                .isNotEqualTo(keyRing.signingKey().getEncoded());
    }

    @ParameterizedTest
    @MethodSource("tooShortSecrets")
    void rejectsSecretsShorterThanThirtyTwoBytes(String secret) {
        assertThatThrownBy(() -> new KeyRing(withSecret(secret)))
                .isInstanceOf(IllegalStateException.class)
                .hasMessage(INVALID_SECRET)
                .hasNoCause();
    }

    static Stream<String> tooShortSecrets() {
        return Stream.of("", "   ", "c2VjcmV0", secretOf(sequence(31, 0)), secretOf(new byte[16]));
    }

    @ParameterizedTest
    @ValueSource(strings = {"not base64 at all!", "%%%%", "A", "AAAA====AAAA"})
    void rejectsSecretsThatAreNotBase64(String secret) {
        assertThatThrownBy(() -> new KeyRing(withSecret(secret)))
                .isInstanceOf(IllegalStateException.class)
                .hasMessage(INVALID_SECRET)
                .hasCauseInstanceOf(IllegalArgumentException.class);
    }

    private static byte[] sequence(int length, int offset) {
        var bytes = new byte[length];
        for (var index = 0; index < length; index++) {
            bytes[index] = (byte) (index + offset);
        }
        return bytes;
    }

    private static byte[] hkdf(byte[] inputKeyMaterial, String info) {
        var pseudoRandomKey = hmac(SALT.getBytes(UTF_8), inputKeyMaterial);
        var infoBytes = info.getBytes(UTF_8);
        var firstBlock = Arrays.copyOf(infoBytes, infoBytes.length + 1);
        firstBlock[infoBytes.length] = 1;
        return hmac(pseudoRandomKey, firstBlock);
    }

    private static byte[] hmac(byte[] key, byte[] data) {
        try {
            var mac = Mac.getInstance(HMAC);
            mac.init(new SecretKeySpec(key, HMAC));
            return mac.doFinal(data);
        } catch (GeneralSecurityException e) {
            throw new AssertionError(e);
        }
    }
}
