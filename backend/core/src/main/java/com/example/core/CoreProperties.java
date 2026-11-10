package com.example.core;

import module java.base;

import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.boot.context.properties.bind.DefaultValue;

@ConfigurationProperties("core")
public record CoreProperties(
    @DefaultValue("Service") String name,
    @DefaultValue("") String description,
    @DefaultValue Csp csp,
    @DefaultValue Cors cors,
    @DefaultValue Security security) {

    public record Csp(@DefaultValue List<String> trustedSources, @DefaultValue List<String> connectSources) {}

    public record Cors(@DefaultValue List<String> allowedOrigins) {}

    /// `publicPaths` are path patterns a service serves without a token, next to the pages every service has.
    public record Security(@DefaultValue List<String> publicPaths) {}
}
