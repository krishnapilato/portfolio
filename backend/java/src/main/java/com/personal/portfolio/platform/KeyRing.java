package com.personal.portfolio.platform;

import module java.base;
import static java.nio.charset.StandardCharsets.UTF_8;

import org.springframework.stereotype.Component;

// Every key is derived from the single APP_SECRET with HKDF, one key per purpose,
// so the JWT signing key and the token pepper never share bytes.
@Component
public final class KeyRing {

    private static final String HMAC = "HmacSHA256";
    private static final String SALT = "portfolio/key-ring/v1";
    private static final int KEY_BYTES = 32;
    private static final String INVALID_SECRET = "APP_SECRET must be base64 encoding at least 32 random bytes";

    private final SecretKey signingKey;
    private final SecretKey pepper;

    public KeyRing(AppProperties properties) {
        var master = decode(properties.security().secret());
        this.signingKey = derive(master, "jwt/hs256");
        this.pepper = derive(master, "token/fingerprint");
    }

    public SecretKey signingKey() {
        return signingKey;
    }

    public String fingerprint(String token) {
        try {
            var mac = Mac.getInstance(HMAC);
            mac.init(pepper);
            return HexFormat.of().formatHex(mac.doFinal(token.getBytes(UTF_8)));
        } catch (GeneralSecurityException e) {
            throw new IllegalStateException("HMAC-SHA256 is unavailable", e);
        }
    }

    private static byte[] decode(String secret) {
        try {
            var master = Base64.getDecoder().decode(secret.strip());
            if (master.length >= KEY_BYTES) return master;
            throw new IllegalStateException(INVALID_SECRET);
        } catch (IllegalArgumentException e) {
            throw new IllegalStateException(INVALID_SECRET, e);
        }
    }

    private static SecretKey derive(byte[] master, String info) {
        try {
            var spec = HKDFParameterSpec.ofExtract().addIKM(master).addSalt(SALT.getBytes(UTF_8)).thenExpand(info.getBytes(UTF_8), KEY_BYTES);
            return KDF.getInstance("HKDF-SHA256").deriveKey(HMAC, spec);
        } catch (GeneralSecurityException e) {
            throw new IllegalStateException("HKDF-SHA256 is unavailable", e);
        }
    }
}
