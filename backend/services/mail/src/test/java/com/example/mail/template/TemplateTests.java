package com.example.mail.template;

import module java.base;
import static org.assertj.core.api.Assertions.assertThat;

import com.example.mail.MailIntegrationTest;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;

class TemplateTests extends MailIntegrationTest {

    @Autowired
    private Templates templates;

    @Test
    void comesWithTheTemplatesTheNewsletterNeeds() {
        assertThat(mvc.get().uri("/api/v1/templates").with(admin()))
            .hasStatusOk()
            .bodyJson()
            .extractingPath("$[*].name")
            .asArray()
            .contains("newsletter", "subscription-confirmation");
    }

    @Test
    void escapesValuesInTheBodyAndKeepsTheSubjectOnOneLine() {
        templates.save("escaping", "Hello {{name}}\r\nBcc: someone@else.test", "<p>{{name}} {{missing}}</p>");

        var rendered = templates.render("escaping", Map.of("name", "<b>Ada</b>"));

        assertThat(rendered.subject()).isEqualTo("Hello <b>Ada</b> Bcc: someone@else.test");
        assertThat(rendered.html()).isEqualTo("<p>&lt;b&gt;Ada&lt;/b&gt; </p>");
    }

    @Test
    void createsRevisesAndDeletesATemplate() {
        assertThat(save("welcome", "Welcome", "<p>Hi {{name}}</p>"))
            .hasStatusOk()
            .bodyJson()
            .isLenientlyEqualTo("""
                {"name": "welcome", "subject": "Welcome", "body": "<p>Hi {{name}}</p>"}
                """);
        assertThat(save("welcome", "Welcome back", "<p>Hello {{name}}</p>")).hasStatusOk();
        assertThat(mvc.get().uri("/api/v1/templates/welcome").with(admin()))
            .bodyJson()
            .isLenientlyEqualTo("""
                {"subject": "Welcome back", "body": "<p>Hello {{name}}</p>"}
                """)
            .hasPath("$.updatedAt");

        assertThat(mvc.delete().uri("/api/v1/templates/welcome").with(admin())).hasStatus(HttpStatus.NO_CONTENT);
        assertThat(mvc.get().uri("/api/v1/templates/welcome").with(admin()))
            .hasStatus(HttpStatus.NOT_FOUND)
            .bodyJson()
            .isLenientlyEqualTo("""
                {"type": "urn:problem:not-found", "detail": "Template 'welcome' does not exist"}
                """);
    }

    @Test
    void refusesATemplateThatDoesNotCompile() {
        assertThat(save("broken", "Fine", "<p>{{#open}}never closed</p>"))
            .hasStatus(HttpStatus.BAD_REQUEST)
            .bodyJson()
            .isLenientlyEqualTo("""
                {"type": "urn:problem:invalid-template", "title": "Invalid template"}
                """)
            .extractingPath("$.detail")
            .asString()
            .isNotBlank();
        assertThat(save("broken-subject", "{{#open}}", "<p>Fine</p>")).hasStatus(HttpStatus.BAD_REQUEST);
    }

    @Test
    void refusesAnInvalidName() {
        assertThat(save("Not A Slug", "Subject", "<p>Body</p>")).hasStatus(HttpStatus.BAD_REQUEST);
    }

    @Test
    void keepsTemplatesForAdministrators() {
        assertThat(mvc.get().uri("/api/v1/templates").with(as("user"))).hasStatus(HttpStatus.FORBIDDEN);
        assertThat(mvc.get().uri("/api/v1/templates")).hasStatus(HttpStatus.UNAUTHORIZED);
    }

    private org.springframework.test.web.servlet.assertj.MvcTestResult save(String name, String subject, String body) {
        return mvc.put().uri("/api/v1/templates/{name}", name).with(admin()).contentType(MediaType.APPLICATION_JSON)
            .content("{\"subject\":%s,\"body\":%s}".formatted(quote(subject), quote(body))).exchange();
    }

    private static String quote(String value) {
        return "\"" + value.replace("\\", "\\\\").replace("\"", "\\\"").replace("\r", "\\r").replace("\n", "\\n") + "\"";
    }
}
