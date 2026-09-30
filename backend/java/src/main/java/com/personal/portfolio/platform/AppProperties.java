package com.personal.portfolio.platform;

import jakarta.validation.Valid;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import java.net.URI;
import java.time.Duration;
import java.util.List;
import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.boot.context.properties.bind.DefaultValue;
import org.springframework.core.io.Resource;
import org.springframework.validation.annotation.Validated;

@Validated
@ConfigurationProperties("app")
public record AppProperties(
        @NotNull URI frontendUrl,
        @Valid @DefaultValue Cors cors,
        @Valid @DefaultValue Security security,
        @Valid @DefaultValue Mail mail,
        @Valid @DefaultValue Seed seed) {

    public record Cors(@DefaultValue("http://localhost:5173") List<String> allowedOrigins) {}

    public record Security(
            @NotBlank String secret,
            @DefaultValue("portfolio") String issuer,
            @DefaultValue("portfolio-api") String audience,
            @DefaultValue("15m") Duration accessTokenTtl,
            @DefaultValue("30d") Duration refreshTokenTtl,
            @DefaultValue("24h") Duration verificationTtl,
            @DefaultValue("1h") Duration passwordResetTtl,
            @DefaultValue("5") @Min(1) int maxFailedLogins,
            @DefaultValue("15m") Duration lockout,
            @DefaultValue("2m") Duration emailCooldown,
            @DefaultValue("30") @Min(1) int authRequestsPerMinute,
            @DefaultValue("") String scrapePassword) {}

    public record Mail(
            @NotBlank @Email String from,
            @DefaultValue("Portfolio") String sender,
            @DefaultValue("25") @Min(1) int batchSize,
            @DefaultValue("8") @Min(1) int concurrency,
            @DefaultValue("5") @Min(1) int maxAttempts,
            @DefaultValue("30s") Duration initialBackoff,
            @DefaultValue("1h") Duration maxBackoff,
            @DefaultValue("15m") Duration staleAfter) {}

    public record Seed(
            @DefaultValue("false") boolean enabled,
            @DefaultValue("classpath:seed/users.json") Resource users) {}
}
