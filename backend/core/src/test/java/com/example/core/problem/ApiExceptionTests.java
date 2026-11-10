package com.example.core.problem;

import module java.base;
import static org.assertj.core.api.Assertions.assertThat;

import org.junit.jupiter.api.Test;
import org.springframework.http.HttpStatus;

class ApiExceptionTests {

    @Test
    void describesAProblemAsProblemDetail() {
        var body = new ApiException(new NotFound("Item", 42)).getBody();

        assertThat(body.getStatus()).isEqualTo(404);
        assertThat(body.getTitle()).isEqualTo("Resource not found");
        assertThat(body.getDetail()).isEqualTo("Item '42' does not exist");
        assertThat(body.getType()).isEqualTo(URI.create("urn:problem:not-found"));
        assertThat(body.getProperties()).isNull();
    }

    @Test
    void namesTheTypeAfterAnyNewProblemAndCarriesItsProperties() {
        var exception = new ApiException(new QuotaExceeded2Times(7));

        assertThat(exception.getStatusCode()).isEqualTo(HttpStatus.TOO_MANY_REQUESTS);
        assertThat(exception.getBody().getType()).isEqualTo(URI.create("urn:problem:quota-exceeded2-times"));
        assertThat(exception.getBody().getProperties()).containsExactly(Map.entry("remaining", 7));
    }

    private record QuotaExceeded2Times(int remaining) implements Problem {

        @Override
        public HttpStatus status() {
            return HttpStatus.TOO_MANY_REQUESTS;
        }

        @Override
        public String title() {
            return "Quota exceeded";
        }

        @Override
        public String detail() {
            return "Try again later";
        }

        @Override
        public Map<String, Object> properties() {
            return Map.of("remaining", remaining);
        }
    }
}
