package com.personal.portfolio.platform;

import static org.assertj.core.api.Assertions.assertThat;

import io.swagger.v3.oas.models.security.SecurityScheme;
import java.time.ZoneOffset;
import java.time.temporal.ChronoUnit;
import java.util.Map;
import java.util.Properties;
import java.util.stream.IntStream;
import org.jspecify.annotations.Nullable;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.params.ParameterizedTest;
import org.junit.jupiter.params.provider.CsvSource;
import org.springframework.beans.factory.support.StaticListableBeanFactory;
import org.springframework.boot.actuate.audit.AuditEvent;
import org.springframework.boot.info.BuildProperties;
import org.springframework.mock.web.MockHttpServletRequest;
import org.springframework.web.util.ServletRequestPathUtils;

class PlatformConfigTests {

    private final PlatformConfig config = new PlatformConfig();

    @Test
    void tellsTimeInUtc() {
        assertThat(config.clock().getZone()).isEqualTo(ZoneOffset.UTC);
    }

    @Test
    void tellsTimeInWholeMicrosecondsLikeTheDatabaseStoresIt() {
        var clock = config.clock();

        for (var sample = 0; sample < 100; sample++) {
            var now = clock.instant();
            assertThat(now).isEqualTo(now.truncatedTo(ChronoUnit.MICROS));
        }
    }

    @Test
    void keepsTheLatestThousandAuditEvents() {
        var repository = config.auditEventRepository();

        IntStream.rangeClosed(1, 1_001).forEach(index -> repository.add(new AuditEvent("user-" + index, "PROBE")));

        var events = repository.find(null, null, "PROBE");
        assertThat(events).hasSize(1_000);
        assertThat(events).extracting(AuditEvent::getPrincipal).doesNotContain("user-1").contains("user-1001");
    }

    @ParameterizedTest(name = "{0} -> {1}")
    @CsvSource(nullValues = "none", value = {
            "/api/v1/users, v1",
            "/api/v2/me, v2",
            "/api/v1, v1",
            "/system/snapshot, none",
            "/, none",
            "/apiary/v1/users, none"})
    void readsTheApiVersionFromTheSecondPathSegmentOfApiRequests(String path, @Nullable String version) {
        var request = new MockHttpServletRequest("GET", path);
        ServletRequestPathUtils.parseAndCache(request);

        assertThat(config.apiVersionResolver().resolveVersion(request)).isEqualTo(version);
    }

    @Test
    void documentsTheApiWithAGlobalBearerScheme() {
        var build = new Properties();
        build.setProperty("version", "2.3.4");

        var openApi = config.openApi(new StaticListableBeanFactory(Map.of("build", new BuildProperties(build)))
                .getBeanProvider(BuildProperties.class));

        assertThat(openApi.getInfo()).satisfies(info -> {
            assertThat(info.getTitle()).isEqualTo("Portfolio Platform API");
            assertThat(info.getVersion()).isEqualTo("2.3.4");
            assertThat(info.getContact().getName()).isEqualTo("Khova Krishna Pilato");
            assertThat(info.getContact().getUrl()).isEqualTo("https://krishnapilato.github.io/portfolio");
            assertThat(info.getLicense().getName()).isEqualTo("MIT");
        });
        assertThat(openApi.getComponents().getSecuritySchemes()).hasEntrySatisfying("bearer-jwt", scheme -> {
            assertThat(scheme.getType()).isEqualTo(SecurityScheme.Type.HTTP);
            assertThat(scheme.getScheme()).isEqualTo("bearer");
            assertThat(scheme.getBearerFormat()).isEqualTo("JWT");
        });
        assertThat(openApi.getSecurity()).singleElement().satisfies(requirement ->
                assertThat(requirement).containsOnlyKeys("bearer-jwt"));
        assertThat(openApi.getServers()).singleElement().satisfies(server ->
                assertThat(server.getUrl()).isEqualTo("/"));
    }

    @Test
    void versionsTheDocumentationAsDevelopmentWithoutBuildInformation() {
        var openApi = config.openApi(new StaticListableBeanFactory().getBeanProvider(BuildProperties.class));

        assertThat(openApi.getInfo().getVersion()).isEqualTo("dev");
    }
}
