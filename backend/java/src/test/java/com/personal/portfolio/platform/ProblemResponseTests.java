package com.personal.portfolio.platform;

import static org.assertj.core.api.Assertions.assertThat;

import com.personal.portfolio.support.IntegrationTest;
import java.util.UUID;
import org.junit.jupiter.api.Test;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;

class ProblemResponseTests extends IntegrationTest {

    private static final String HEADER = CorrelationFilter.HEADER;

    @Test
    void rendersDomainProblemsAsProblemJson() {
        var id = Long.MAX_VALUE - 7;

        assertThat(mvc.get().uri("/api/v1/users/{id}", id).with(admin()).header(HEADER, "problem-json-0001"))
                .hasStatus(HttpStatus.NOT_FOUND)
                .hasContentTypeCompatibleWith(MediaType.APPLICATION_PROBLEM_JSON)
                .bodyJson()
                .isLenientlyEqualTo("""
                        {
                          "type": "urn:problem:not-found",
                          "title": "Resource not found",
                          "status": 404,
                          "detail": "user '%d' does not exist",
                          "requestId": "problem-json-0001"
                        }
                        """.formatted(id))
                .hasPath("$.timestamp");
    }

    @Test
    void listsTheSupportedSortPropertiesAlphabetically() {
        assertThat(mvc.get().uri("/api/v1/users").param("sort", "passwordHash,asc").with(admin()))
                .hasStatus(HttpStatus.BAD_REQUEST)
                .hasContentTypeCompatibleWith(MediaType.APPLICATION_PROBLEM_JSON)
                .bodyJson()
                .isLenientlyEqualTo("""
                        {
                          "type": "urn:problem:unsupported-sort",
                          "title": "Unsupported sort property",
                          "detail": "Sorting by 'passwordHash' is not supported"
                        }
                        """)
                .hasPathSatisfying("$.allowed", allowed -> assertThat(allowed).asArray().containsExactly(
                        "createdAt", "email", "fullName", "lastLoginAt", "role", "status", "updatedAt"));
    }

    @Test
    void mapsBeanValidationFailuresToFieldErrors() {
        assertThat(mvc.post().uri("/api/v1/auth/login")
                .contentType(MediaType.APPLICATION_JSON)
                .content("""
                        {"email": "not-an-email", "password": ""}
                        """))
                .hasStatus(HttpStatus.BAD_REQUEST)
                .hasContentTypeCompatibleWith(MediaType.APPLICATION_PROBLEM_JSON)
                .bodyJson()
                .isLenientlyEqualTo("""
                        {
                          "type": "urn:problem:validation-failed",
                          "title": "Validation failed",
                          "detail": "The request contains 2 invalid field(s)"
                        }
                        """)
                .hasPathSatisfying("$.errors", errors -> assertThat(errors).asMap()
                        .containsOnlyKeys("email", "password"))
                .hasPath("$.requestId")
                .hasPath("$.timestamp");
    }

    @Test
    void decoratesFrameworkErrorsWithCorrelationProperties() {
        assertThat(mvc.post().uri("/api/v1/auth/login")
                .header(HEADER, "unreadable-body-01")
                .contentType(MediaType.APPLICATION_JSON)
                .content("{\"email\": "))
                .hasStatus(HttpStatus.BAD_REQUEST)
                .hasContentTypeCompatibleWith(MediaType.APPLICATION_PROBLEM_JSON)
                .bodyJson()
                .isLenientlyEqualTo("""
                        {"status": 400, "requestId": "unreadable-body-01"}
                        """)
                .hasPath("$.timestamp");
    }

    @Test
    void rejectsMalformedPathVariablesAsProblems() {
        assertThat(mvc.get().uri("/api/v1/users/not-a-number").with(admin()).header(HEADER, "type-mismatch-001"))
                .hasStatus(HttpStatus.BAD_REQUEST)
                .hasContentTypeCompatibleWith(MediaType.APPLICATION_PROBLEM_JSON)
                .bodyJson()
                .isLenientlyEqualTo("""
                        {"status": 400, "requestId": "type-mismatch-001"}
                        """);
    }

    @Test
    void answersUnknownCredentialsWithAProblem() {
        assertThat(mvc.post().uri("/api/v1/auth/login")
                .contentType(MediaType.APPLICATION_JSON)
                .content("""
                        {"email": "%s@nowhere.test", "password": "Wrong-Passw0rd"}
                        """.formatted(UUID.randomUUID())))
                .hasStatus(HttpStatus.UNAUTHORIZED)
                .hasContentTypeCompatibleWith(MediaType.APPLICATION_PROBLEM_JSON)
                .bodyJson()
                .isLenientlyEqualTo("""
                        {"type": "urn:problem:invalid-credentials", "status": 401}
                        """);
    }

    @Test
    void routesOnlyTheSupportedApiVersion() {
        assertThat(mvc.get().uri("/api/v1/users").with(admin())).hasStatusOk();
        assertThat(mvc.get().uri("/api/v2/users").with(admin())).hasStatus(HttpStatus.BAD_REQUEST);
        assertThat(mvc.get().uri("/api/1/users").with(admin())).hasStatus(HttpStatus.NOT_FOUND);
    }
}
