package com.personal.portfolio.platform;

import static java.nio.charset.StandardCharsets.UTF_8;

import java.security.GeneralSecurityException;
import java.util.Base64;
import java.util.HexFormat;
import javax.crypto.KDF;
import javax.crypto.Mac;
import javax.crypto.SecretKey;
import javax.crypto.spec.HKDFParameterSpec;
import org.springframework.stereotype.Component;

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
        byte[] master;
        try {
            master = Base64.getDecoder().decode(secret.strip());
        } catch (IllegalArgumentException e) {
            throw new IllegalStateException(INVALID_SECRET, e);
        }
        if (master.length < KEY_BYTES) {
            throw new IllegalStateException(INVALID_SECRET);
        }
        return master;
    }

    private static SecretKey derive(byte[] master, String info) {
        try {
            return KDF.getInstance("HKDF-SHA256").deriveKey(HMAC, HKDFParameterSpec.ofExtract()
                    .addIKM(master)
                    .addSalt(SALT.getBytes(UTF_8))
                    .thenExpand(info.getBytes(UTF_8), KEY_BYTES));
        } catch (GeneralSecurityException e) {
            throw new IllegalStateException("HKDF-SHA256 is unavailable", e);
        }
    }
}
