package com.personal.portfolio.security;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;

import org.junit.jupiter.api.Test;
import org.junit.jupiter.params.ParameterizedTest;
import org.junit.jupiter.params.provider.CsvSource;
import org.junit.jupiter.params.provider.ValueSource;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.GrantedAuthority;

class ScrapersTests {

    private static final String SECRET = "a-long-random-scrape-secret-0123";

    @Test
    void grantsOnlyTheMetricsRoleToThePrometheusScraper() {
        var authentication = SecurityConfig.scraper(SECRET).authenticate(basic("prometheus", SECRET));

        assertThat(authentication.isAuthenticated()).isTrue();
        assertThat(authentication.getName()).isEqualTo("prometheus");
        assertThat(authentication.getCredentials()).isNull();
        assertThat(authentication.getAuthorities()).extracting(GrantedAuthority::getAuthority)
                .containsExactly("ROLE_METRICS");
    }

    @ParameterizedTest
    @CsvSource({
            "prometheus, a-long-random-scrape-secret-012",
            "prometheus, a-long-random-scrape-secret-01234",
            "prometheus, A-LONG-RANDOM-SCRAPE-SECRET-0123",
            "grafana, a-long-random-scrape-secret-0123"})
    void rejectsAnyOtherUserOrPassword(String user, String password) {
        var scraper = SecurityConfig.scraper(SECRET);

        assertThatThrownBy(() -> scraper.authenticate(basic(user, password)))
                .isInstanceOf(BadCredentialsException.class);
    }

    @ParameterizedTest
    @ValueSource(strings = {"", "   "})
    void turnsScrapingOffWhenNoPasswordIsConfigured(String password) {
        var scraper = SecurityConfig.scraper(password);

        assertThatThrownBy(() -> scraper.authenticate(basic("prometheus", password)))
                .isInstanceOf(BadCredentialsException.class);
    }

    private static Authentication basic(String user, String password) {
        return UsernamePasswordAuthenticationToken.unauthenticated(user, password);
    }
}
