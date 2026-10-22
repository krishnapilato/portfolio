package com.personal.portfolio.auth;

import module java.base;
import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.BDDMockito.given;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.verify;

import com.personal.portfolio.platform.ApiException;
import com.personal.portfolio.platform.Problem.RateLimited;
import com.personal.portfolio.support.AppPropertiesFixture;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.jdbc.test.autoconfigure.AutoConfigureTestDatabase;
import org.springframework.boot.jdbc.test.autoconfigure.JdbcTest;
import org.springframework.jdbc.core.simple.JdbcClient;
import org.springframework.mock.web.MockHttpServletRequest;
import org.springframework.mock.web.MockHttpServletResponse;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.context.TestPropertySource;
import org.springframework.web.servlet.config.annotation.InterceptorRegistration;
import org.springframework.web.servlet.config.annotation.InterceptorRegistry;

@JdbcTest
@ActiveProfiles("test")
@AutoConfigureTestDatabase(replace = AutoConfigureTestDatabase.Replace.NONE)
@TestPropertySource(properties = "spring.datasource.url=jdbc:h2:mem:rate-limit;MODE=MySQL;DATABASE_TO_LOWER=TRUE;DB_CLOSE_DELAY=-1")
class AuthRateLimiterTests {

    private static final Instant NOW = Instant.parse("2026-09-30T08:00:00Z");
    private static final Instant WINDOW_END = NOW.plus(Duration.ofMinutes(1));
    private static final int LIMIT = AppPropertiesFixture.defaults().security().authRequestsPerMinute();
    private static final String CLIENT = "203.0.113.7";

    private final Clock clock = mock(Clock.class);
    private final AtomicReference<Instant> now = new AtomicReference<>(NOW);

    @Autowired
    private JdbcClient jdbc;

    private AuthRateLimiter limiter;

    @BeforeEach
    void setUp() {
        given(clock.instant()).willAnswer(_ -> now.get());
        limiter = instance();
    }

    @Test
    void admitsEachClientUpToTheLimitPerMinute() {
        exhaust(CLIENT);
        now.set(NOW.plusSeconds(20));

        assertThatThrownBy(() -> allow(limiter, CLIENT)).isInstanceOfSatisfying(ApiException.class,
            limited -> assertThat(limited.problem()).isEqualTo(new RateLimited(WINDOW_END)));
        assertThat(allow(limiter, "198.51.100.4")).isTrue();
    }

    @Test
    void startsCountingAfreshExactlyWhenTheWindowEnds() {
        exhaust(CLIENT);
        now.set(WINDOW_END.minusMillis(1));
        assertThatThrownBy(() -> allow(limiter, CLIENT)).isInstanceOf(ApiException.class);

        now.set(WINDOW_END);

        assertThat(allow(limiter, CLIENT)).isTrue();
        assertThatThrownBy(() -> exhaust(CLIENT)).isInstanceOfSatisfying(ApiException.class,
            limited -> assertThat(limited.problem()).isEqualTo(new RateLimited(WINDOW_END.plus(Duration.ofMinutes(1)))));
    }

    @Test
    void sharesTheCountWithEveryOtherInstance() {
        exhaust(CLIENT);

        assertThatThrownBy(() -> allow(instance(), CLIENT)).isInstanceOfSatisfying(ApiException.class,
            limited -> assertThat(limited.problem()).isEqualTo(new RateLimited(WINDOW_END)));
    }

    @Test
    void purgesOnlyTheWindowsThatHaveEnded() {
        allow(limiter, CLIENT);
        now.set(NOW.plusSeconds(30));
        allow(limiter, "198.51.100.4");

        now.set(WINDOW_END.minusMillis(1));
        assertThat(limiter.purgeExpired()).isZero();

        now.set(WINDOW_END);
        assertThat(limiter.purgeExpired()).isEqualTo(1);
        assertThat(jdbc.sql("select client from auth_rate_limits").query(String.class).list()).containsExactly("198.51.100.4");
    }

    @Test
    void guardsOnlyTheAuthenticationEndpoints() {
        var registry = mock(InterceptorRegistry.class);
        var registration = mock(InterceptorRegistration.class);
        given(registry.addInterceptor(limiter)).willReturn(registration);

        limiter.addInterceptors(registry);

        verify(registration).addPathPatterns("/api/*/auth/**");
    }

    private AuthRateLimiter instance() {
        return new AuthRateLimiter(AppPropertiesFixture.defaults(), clock, jdbc);
    }

    private void exhaust(String address) {
        for (var request = 0; request < LIMIT; request++) {
            assertThat(allow(limiter, address)).isTrue();
        }
    }

    private static boolean allow(AuthRateLimiter limiter, String address) {
        var request = new MockHttpServletRequest("POST", "/api/v1/auth/login");
        request.setRemoteAddr(address);
        return limiter.preHandle(request, new MockHttpServletResponse(), new Object());
    }
}
