package com.personal.portfolio.config.core;

import jakarta.validation.constraints.*;
import lombok.Getter;
import lombok.Setter;
import org.springframework.boot.context.properties.ConfigurationProperties;

/**
 * Configuration properties for bcrypt password encoder.
 */
@Getter
@Setter
@ConfigurationProperties(prefix = "bcrypt")
public class BcryptProperties {

    /**
     * Strength of the BCrypt encoder.
     * Must be between 4 and 31 (default: 12).
     */
    @NotNull(message = "bcrypt.strength must not be null")
    @Min(value = 4, message = "bcrypt.strength must be at least 4")
    @Max(value = 31, message = "bcrypt.strength must be at most 31")
    private Integer strength = 12;

    /**
     * Optional mode for the encoder.
     * Must be 'STANDARD' or 'LEGACY' if provided.
     */
    @Pattern(regexp = "STANDARD|LEGACY", message = "bcrypt.mode must be either 'STANDARD' or 'LEGACY'")
    private String mode = "STANDARD";

    /**
     * Flag indicating whether bcrypt debug logging is enabled.
     */
    private boolean debugLoggingEnabled = false;

    /**
     * Ensures debug logging can only be enabled when strength is <= 10 (for performance safety).
     */
    @AssertTrue(message = "Debug logging can only be enabled when strength is 10 or less")
    public boolean isDebugAllowed() {
        return !debugLoggingEnabled || (strength != null && strength <= 10);
    }
}