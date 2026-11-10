package com.example.mail;

import module java.base;
import static org.assertj.core.api.Assertions.assertThat;

import org.junit.jupiter.api.Test;

class MailPropertiesTests {

    @Test
    void neverPrintsTheSecret() {
        var properties = new MailProperties("no-reply@foundation.local", "Foundation", URI.create("https://mail.test"), "c2VjcmV0");

        assertThat(properties.toString())
            .isEqualTo("MailProperties[from=no-reply@foundation.local, sender=Foundation, publicUrl=https://mail.test, secret=<redacted>]");
    }
}
