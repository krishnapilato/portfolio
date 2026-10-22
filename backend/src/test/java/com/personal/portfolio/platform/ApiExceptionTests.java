package com.personal.portfolio.platform;

import static org.assertj.core.api.Assertions.assertThat;

import com.personal.portfolio.platform.Problem.NotFound;
import org.junit.jupiter.api.Test;

class ApiExceptionTests {

    @Test
    void carriesItsProblemAsTheMessage() {
        var problem = new NotFound("Message", 7L);

        var exception = new ApiException(problem);

        assertThat(exception.problem()).isSameAs(problem);
        assertThat(exception).hasMessage(problem.toString()).hasNoCause();
    }

    @Test
    void skipsTheStackTraceAndSuppressionBecauseItIsControlFlow() {
        var exception = new ApiException(new Problem.TokenReuse());
        exception.addSuppressed(new IllegalStateException("ignored"));

        assertThat(exception.getStackTrace()).isEmpty();
        assertThat(exception.getSuppressed()).isEmpty();
    }
}
