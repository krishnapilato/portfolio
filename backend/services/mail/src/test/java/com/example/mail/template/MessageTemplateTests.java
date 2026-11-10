package com.example.mail.template;

import module java.base;
import static org.assertj.core.api.Assertions.assertThat;

import org.junit.jupiter.api.Test;

class MessageTemplateTests {

    private static final Instant NOW = Instant.parse("2026-11-10T09:00:00Z");

    @Test
    void startsWithWhatItWasGiven() {
        var template = new MessageTemplate("welcome", "Welcome", "<p>Hi</p>", NOW);

        assertThat(template.getName()).isEqualTo("welcome");
        assertThat(template.getSubject()).isEqualTo("Welcome");
        assertThat(template.getBody()).isEqualTo("<p>Hi</p>");
        assertThat(template.getUpdatedAt()).isEqualTo(NOW);
    }

    @Test
    void keepsItsNameWhenRevised() {
        var template = new MessageTemplate("welcome", "Welcome", "<p>Hi</p>", NOW);

        template.revise("Welcome back", "<p>Hello</p>", NOW.plusSeconds(60));

        assertThat(template.getName()).isEqualTo("welcome");
        assertThat(template.getSubject()).isEqualTo("Welcome back");
        assertThat(template.getBody()).isEqualTo("<p>Hello</p>");
        assertThat(template.getUpdatedAt()).isEqualTo(NOW.plusSeconds(60));
    }
}
