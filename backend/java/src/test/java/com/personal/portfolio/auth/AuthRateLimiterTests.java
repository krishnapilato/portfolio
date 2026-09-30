package com.personal.portfolio.auth;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.BDDMockito.given;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.verify;

import com.personal.portfolio.platform.ApiException;
import com.personal.portfolio.platform.Problem.RateLimited;
import com.personal.portfolio.support.AppPropertiesFixture;
import java.time.Clock;
import java.time.Duration;
import java.time.Instant;
import java.util.concurrent.atomic.AtomicReference;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.mock.web.MockHttpServletRequest;
import org.springframework.mock.web.MockHttpServletResponse;
import org.springframework.web.servlet.config.annotation.InterceptorRegistration;
import org.springframework.web.servlet.config.annotation.InterceptorRegistry;

class AuthRateLimiterTests {

    private static final Instant NOW = Instant.parse("2026-09-30T08:00:00Z");
    private static final Instant WINDOW_END = NOW.plus(Duration.ofMinutes(1));
    private static final int LIMIT = AppPropertiesFixture.defaults().security().authRequestsPerMinute();
    private static final String CLIENT = "203.0.113.7";

    private final Clock clock = mock(Clock.class);
    private final AuthRateLimiter limiter = new AuthRateLimiter(AppPropertiesFixture.defaults(), clock);
    private final AtomicReference<Instant> now = new AtomicReference<>(NOW);

    @BeforeEach
    void stubClock() {
        given(clock.instant()).willAnswer(_ -> now.get());
    }

    @Test
    void admitsEachClientUpToTheLimitPerMinute() {
        exhaust(CLIENT);
        now.set(NOW.plusSeconds(20));

        assertThatThrownBy(() -> allow(CLIENT)).isInstanceOfSatisfying(ApiException.class,
                limited -> assertThat(limited.problem()).isEqualTo(new RateLimited(WINDOW_END)));
        assertThat(allow("198.51.100.4")).isTrue();
    }

    @Test
    void startsCountingAfreshExactlyWhenTheWindowEnds() {
        exhaust(CLIENT);
        now.set(WINDOW_END.minusMillis(1));
        assertThatThrownBy(() -> allow(CLIENT)).isInstanceOf(ApiException.class);

        now.set(WINDOW_END);

        assertThat(allow(CLIENT)).isTrue();
    }

    @Test
    void guardsOnlyTheAuthenticationEndpoints() {
        var registry = mock(InterceptorRegistry.class);
        var registration = mock(InterceptorRegistration.class);
        given(registry.addInterceptor(limiter)).willReturn(registration);

        limiter.addInterceptors(registry);

        verify(registration).addPathPatterns("/api/*/auth/**");
    }

    private void exhaust(String address) {
        for (var request = 0; request < LIMIT; request++) {
            assertThat(allow(address)).isTrue();
        }
    }

    private boolean allow(String address) {
        var request = new MockHttpServletRequest("POST", "/api/v1/auth/login");
        request.setRemoteAddr(address);
        return limiter.preHandle(request, new MockHttpServletResponse(), new Object());
    }
}
