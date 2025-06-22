package com.personal.portfolio.config.admin;

import lombok.Getter;
import lombok.Setter;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.validation.annotation.Validated;
import org.springframework.context.annotation.Configuration;

@Getter
@Setter
@Validated
@Configuration
@ConfigurationProperties(prefix = "spring.security.user")
public class AdminConfig {

    @NotBlank(message = "Admin name must not be blank")
    @Pattern(regexp = "^[A-Za-z ]+$", message = "Admin name must contain only letters and spaces")
    private String name;

    @NotBlank(message = "Admin password must not be blank")
    private String password;

    @NotBlank(message = "Admin email must not be blank")
    @Email(message = "Admin email must be a valid email format")
    private String email;
}