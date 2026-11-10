package com.example.core.problem;

import static org.assertj.core.api.Assertions.assertThat;

import com.example.core.support.IntegrationTest;
import com.example.core.web.RequestIdFilter;
import org.junit.jupiter.api.Test;
import org.springframework.boot.test.system.CapturedOutput;
import org.springframework.boot.test.system.OutputCaptureExtension;
import org.junit.jupiter.api.extension.ExtendWith;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;

@ExtendWith(OutputCaptureExtension.class)
class ProblemHandlerTests extends IntegrationTest {

    @Test
    void rendersAProblemAsProblemJsonWithTheRequestId() {
        assertThat(mvc.get().uri("/probe/items/lamp").with(signedIn()).header(RequestIdFilter.HEADER, "problem-0001"))
            .hasStatus(HttpStatus.NOT_FOUND)
            .hasContentTypeCompatibleWith(MediaType.APPLICATION_PROBLEM_JSON)
            .bodyJson()
            .isLenientlyEqualTo("""
                {
                  "type": "urn:problem:not-found",
                  "title": "Resource not found",
                  "status": 404,
                  "detail": "Item 'lamp' does not exist",
                  "instance": "/probe/items/lamp",
                  "requestId": "problem-0001"
                }
                """)
            .hasPath("$.timestamp");
    }

    @Test
    void refusesAnOperationTheCallerHasNoRoleFor() {
        assertThat(mvc.get().uri("/probe/admin").with(signedIn("user")))
            .hasStatus(HttpStatus.FORBIDDEN)
            .bodyJson()
            .isLenientlyEqualTo("""
                {"title": "Access denied", "detail": "You are not allowed to perform this operation"}
                """);
    }

    @Test
    void hidesTheCauseOfAnUnexpectedError(CapturedOutput output) {
        assertThat(mvc.get().uri("/probe/failure").with(signedIn()))
            .hasStatus(HttpStatus.INTERNAL_SERVER_ERROR)
            .bodyJson()
            .isLenientlyEqualTo("""
                {"title": "Internal error", "detail": "An unexpected error occurred"}
                """);
        assertThat(output).contains("An unexpected error occurred").doesNotContain("hunter2");
    }

    @Test
    void namesEveryInvalidFieldOnce() {
        assertThat(mvc.post().uri("/probe/items").with(signedIn())
            .contentType(MediaType.APPLICATION_JSON).content("{\"name\":\" \",\"code\":\"toolong\"}"))
            .hasStatus(HttpStatus.BAD_REQUEST)
            .bodyJson()
            .isLenientlyEqualTo("""
                {"errors": {"name": "must not be blank", "code": "size must be between 0 and 3"}}
                """);
    }
}
