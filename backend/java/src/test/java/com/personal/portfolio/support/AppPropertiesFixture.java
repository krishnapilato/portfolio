package com.personal.portfolio.support;

import com.personal.portfolio.platform.AppProperties;
import java.net.URI;
import java.time.Duration;
import java.util.Base64;
import java.util.List;
import org.springframework.core.io.ByteArrayResource;
import org.springframework.core.io.Resource;

public final class AppPropertiesFixture {

    public static final String ISSUER = "portfolio-test";
    public static final String AUDIENCE = "portfolio-test-api";
    public static final Duration ACCESS_TOKEN_TTL = Duration.ofMinutes(15);
    public static final String MAIL_FROM = "no-reply@test.local";
    public static final String MAIL_SENDER = "Portfolio";
    public static final Duration STALE_AFTER = Duration.ofMinutes(15);

    private static final String DEFAULT_SECRET = secretOf(new byte[32]);

    private AppPropertiesFixture() {}

    public static String secretOf(byte[] master) {
        return Base64.getEncoder().encodeToString(master);
    }

    public static AppProperties defaults() {
        return withSecret(DEFAULT_SECRET);
    }

    public static AppProperties withSecret(String secret) {
        return with(secret, ACCESS_TOKEN_TTL);
    }

    public static AppProperties with(String secret, Duration accessTokenTtl) {
        return create(secret, accessTokenTtl, new AppProperties.Seed(false, new ByteArrayResource(new byte[0])));
    }

    public static AppProperties withSeed(Resource users) {
        return create(DEFAULT_SECRET, ACCESS_TOKEN_TTL, new AppProperties.Seed(true, users));
    }

    private static AppProperties create(String secret, Duration accessTokenTtl, AppProperties.Seed seed) {
        return new AppProperties(
                URI.create("http://localhost:5173/portfolio"),
                new AppProperties.Cors(List.of("http://localhost:5173")),
                new AppProperties.Security(secret, ISSUER, AUDIENCE, accessTokenTtl, Duration.ofDays(30),
                        Duration.ofHours(24), Duration.ofHours(1), 5, Duration.ofMinutes(15), Duration.ofMinutes(2),
                        30, ""),
                new AppProperties.Mail(MAIL_FROM, MAIL_SENDER, 25, 8, 5, Duration.ofSeconds(30), Duration.ofHours(1),
                        STALE_AFTER),
                seed);
    }
}
