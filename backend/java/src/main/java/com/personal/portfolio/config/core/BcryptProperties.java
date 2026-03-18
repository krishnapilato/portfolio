package com.personal.portfolio.config.core;

import jakarta.validation.constraints.AssertTrue;
import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.Pattern;
import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.boot.context.properties.bind.DefaultValue;
import org.springframework.validation.annotation.Validated;

@Validated
@ConfigurationProperties(prefix = "bcrypt")
public record BcryptProperties(

        @DefaultValue("12") @Min(4) @Max(31) int strength,

        @DefaultValue("STANDARD") @Pattern(regexp = "STANDARD|LEGACY") String mode,

        @DefaultValue("false") boolean debugLoggingEnabled

) {
    @AssertTrue(message = "Debug logging can only be enabled when strength is 10 or less")
    public boolean isDebugAllowed() {
        return !debugLoggingEnabled || strength <= 10;
    }
}