package com.personal.portfolio.platform;

import module java.base;

import jakarta.validation.Valid;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Pattern;
import org.hibernate.validator.constraints.time.DurationMin;
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

    public record Cors(@DefaultValue("http://localhost:5173") List<String> allowedOrigins) { }

    public record Security(
        @NotBlank String secret,
        @DefaultValue("portfolio") String issuer,
        @DefaultValue("portfolio-api") String audience,
        @DefaultValue("15m") @DurationMin(seconds = 1) Duration accessTokenTtl,
        @DefaultValue("30d") @DurationMin(seconds = 1) Duration refreshTokenTtl,
        @DefaultValue("24h") @DurationMin(seconds = 1) Duration verificationTtl,
        @DefaultValue("1h") @DurationMin(seconds = 1) Duration passwordResetTtl,
        @DefaultValue("5") @Min(1) int maxFailedLogins,
        @DefaultValue("15m") @DurationMin(seconds = 1) Duration lockout,
        @DefaultValue("2m") @DurationMin Duration emailCooldown,
        @DefaultValue("30") @Min(1) int authRequestsPerMinute,
        @DefaultValue("") @Pattern(regexp = "|.{24,}", message = "must be empty or at least 24 characters")
        String scrapePassword) {
    }

    public record Mail(
        @NotBlank @Email String from,
        @DefaultValue("Portfolio") String sender,
        @DefaultValue("25") @Min(1) int batchSize,
        @DefaultValue("8") @Min(1) int concurrency,
        @DefaultValue("5") @Min(1) int maxAttempts,
        @DefaultValue("30s") @DurationMin(seconds = 1) Duration initialBackoff,
        @DefaultValue("1h") @DurationMin(seconds = 1) Duration maxBackoff,
        @DefaultValue("15m") @DurationMin(seconds = 1) Duration staleAfter,
        @DefaultValue("30d") @DurationMin(seconds = 1) Duration retention) {
    }

    public record Seed(
        @DefaultValue("false") boolean enabled,
        @DefaultValue("classpath:seed/users.json") Resource users) {
    }
}
