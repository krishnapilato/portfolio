package com.personal.portfolio.security;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;

import org.junit.jupiter.api.Test;
import org.junit.jupiter.params.ParameterizedTest;
import org.junit.jupiter.params.provider.ValueSource;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.security.crypto.factory.PasswordEncoderFactories;
import org.springframework.security.crypto.password.PasswordEncoder;

class ScrapersTests {

    private final PasswordEncoder encoder = PasswordEncoderFactories.createDelegatingPasswordEncoder();

    @Test
    void registersThePrometheusScraperWithTheMetricsRoleWhenAPasswordIsConfigured() {
        var scraper = SecurityConfig.scrapers("Scrape-Secret-1", encoder).loadUserByUsername("prometheus");

        assertThat(scraper.getAuthorities()).extracting(GrantedAuthority::getAuthority).containsExactly("ROLE_METRICS");
        assertThat(encoder.matches("Scrape-Secret-1", scraper.getPassword())).isTrue();
        assertThat(scraper.getPassword()).doesNotContain("Scrape-Secret-1");
    }

    @ParameterizedTest
    @ValueSource(strings = {"", "   "})
    void disablesBasicScrapingWhenNoPasswordIsConfigured(String password) {
        var scrapers = SecurityConfig.scrapers(password, encoder);

        assertThatThrownBy(() -> scrapers.loadUserByUsername("prometheus"))
                .isInstanceOf(UsernameNotFoundException.class);
    }
}
