package com.example.mail.newsletter;

import module java.base;
import static java.nio.charset.StandardCharsets.UTF_8;

import com.example.mail.MailProperties;
import org.springframework.stereotype.Component;
import org.springframework.web.util.UriComponentsBuilder;

/// Confirmation and unsubscribe links carry a signed token instead of a stored one: nothing to look up, nothing to
/// leak from the database, and a link for one subscriber or one action cannot be turned into another.
@Component
class SubscriptionLinks {

    private static final String HMAC = "HmacSHA256";
    private static final Base64.Encoder ENCODER = Base64.getUrlEncoder().withoutPadding();
    private static final Base64.Decoder DECODER = Base64.getUrlDecoder();

    private final SecretKeySpec key;
    private final URI publicUrl;

    SubscriptionLinks(MailProperties properties) {
        this.key = new SecretKeySpec(Base64.getDecoder().decode(properties.secret()), HMAC);
        this.publicUrl = properties.publicUrl();
    }

    URI link(Action action, UUID subscriber) {
        var id = subscriber.toString();
        return UriComponentsBuilder.fromUri(publicUrl).path("/subscriptions/{action}")
            .queryParam("token", ENCODER.encodeToString(id.getBytes(UTF_8)) + "." + sign(action, id))
            .build(action.path());
    }

    Optional<UUID> verify(Action action, String token) {
        var parts = token.split("\\.", -1);
        if (parts.length != 2) return Optional.empty();
        try {
            var id = new String(DECODER.decode(parts[0]), UTF_8);
            var expected = sign(action, id).getBytes(UTF_8);
            return MessageDigest.isEqual(expected, parts[1].getBytes(UTF_8)) ? Optional.of(UUID.fromString(id)) : Optional.empty();
        } catch (IllegalArgumentException _) {
            return Optional.empty();
        }
    }

    private String sign(Action action, String id) {
        try {
            var mac = Mac.getInstance(HMAC);
            mac.init(key);
            return ENCODER.encodeToString(mac.doFinal((action.path() + ":" + id).getBytes(UTF_8)));
        } catch (GeneralSecurityException e) {
            throw new IllegalStateException("HMAC-SHA256 is unavailable", e);
        }
    }

    enum Action {
        CONFIRM("confirm"), UNSUBSCRIBE("unsubscribe");

        private final String path;

        Action(String path) {
            this.path = path;
        }

        String path() {
            return path;
        }
    }
}
