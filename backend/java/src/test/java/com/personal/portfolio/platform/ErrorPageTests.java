package com.personal.portfolio.platform;

import static org.assertj.core.api.Assertions.assertThat;

import com.personal.portfolio.security.AccessTokens;
import com.personal.portfolio.support.IntegrationTest;
import com.personal.portfolio.user.UserRepository;
import java.io.IOException;
import java.net.URI;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse.BodyHandlers;
import java.net.http.HttpResponse;
import java.util.UUID;
import org.jspecify.annotations.Nullable;
import org.junit.jupiter.api.AfterAll;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest.WebEnvironment;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.test.web.server.LocalServerPort;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import tools.jackson.databind.JsonNode;
import tools.jackson.databind.json.JsonMapper;

@SpringBootTest(webEnvironment = WebEnvironment.RANDOM_PORT)
class ErrorPageTests extends IntegrationTest {

    private static final HttpClient CLIENT = HttpClient.newBuilder().version(HttpClient.Version.HTTP_1_1).build();

    @LocalServerPort
    private int port;

    @Autowired
    private AccessTokens accessTokens;

    @Autowired
    private UserRepository users;

    @Autowired
    private JsonMapper json;

    @AfterAll
    static void closeClient() {
        CLIENT.close();
    }

    @Test
    void rendersTheErrorTemplateForBrowsers() throws Exception {
        var requestId = "html-error-" + UUID.randomUUID();

        var response = send("/missing-page", MediaType.TEXT_HTML_VALUE, requestId, adminBearer());

        assertThat(response.statusCode()).isEqualTo(404);
        assertThat(response.headers().firstValue(HttpHeaders.CONTENT_TYPE)).hasValueSatisfying(type ->
                assertThat(MediaType.parseMediaType(type).isCompatibleWith(MediaType.TEXT_HTML)).isTrue());
        assertThat(response.headers().firstValue(CorrelationFilter.HEADER)).contains(requestId);
        assertThat(response.body())
                .contains("<title>404 Not Found · Portfolio Platform</title>")
                .contains("Page not found")
                .contains("<code>" + requestId + "</code>")
                .contains("<code>/missing-page</code>")
                .doesNotContain("<script");
    }

    @Test
    void answersApiClientsWithAJsonErrorBody() throws Exception {
        var requestId = "json-error-" + UUID.randomUUID();

        var response = send("/missing-page", MediaType.APPLICATION_JSON_VALUE, requestId, adminBearer());

        assertThat(response.statusCode()).isEqualTo(404);
        assertThat(response.headers().firstValue(CorrelationFilter.HEADER)).contains(requestId);
        var body = json.readTree(response.body());
        assertThat(body.path("status").asInt()).isEqualTo(404);
        assertThat(text(body, "error")).isEqualTo("Not Found");
        assertThat(text(body, "path")).isEqualTo("/missing-page");
        assertThat(text(body, "timestamp")).isNotBlank();
        assertThat(body.has("message")).isFalse();
        assertThat(body.has("trace")).isFalse();
    }

    @Test
    void generatesARequestIdForTheErrorPageWhenNoneWasSent() throws Exception {
        var response = send("/missing-page", MediaType.TEXT_HTML_VALUE, null, adminBearer());

        var header = response.headers().firstValue(CorrelationFilter.HEADER).orElseThrow();
        assertThat(UUID.fromString(header).version()).isEqualTo(7);
        assertThat(response.body()).contains("<code>" + header + "</code>");
    }

    @Test
    void rendersTheSignInPageForAnonymousBrowsers() throws Exception {
        var requestId = "anonymous-html-" + UUID.randomUUID();

        var response = send("/missing-page", MediaType.TEXT_HTML_VALUE, requestId, null);

        assertThat(response.statusCode()).isEqualTo(401);
        assertThat(response.headers().firstValue(HttpHeaders.WWW_AUTHENTICATE)).hasValueSatisfying(challenge ->
                assertThat(challenge).startsWith("Bearer"));
        assertThat(response.body())
                .contains("Sign-in required")
                .contains("<code>" + requestId + "</code>");
    }

    @Test
    void keepsTheBearerChallengeBareForApiClients() throws Exception {
        var response = send("/missing-page", MediaType.APPLICATION_JSON_VALUE, null, null);

        assertThat(response.statusCode()).isEqualTo(401);
        assertThat(response.headers().firstValue(HttpHeaders.WWW_AUTHENTICATE)).isPresent();
        assertThat(response.body()).isEmpty();
    }

    @Test
    void rendersNotFoundForPublicPathsWithoutSigningIn() throws Exception {
        var response = send("/favicon.ico", MediaType.TEXT_HTML_VALUE, null, null);

        assertThat(response.statusCode()).isEqualTo(404);
        assertThat(response.body()).contains("Page not found").contains("<code>/favicon.ico</code>");
    }

    @Test
    void rejectsUnsupportedApiVersions() throws Exception {
        var response = send("/api/v2/users", MediaType.APPLICATION_JSON_VALUE, "api-version-0001", adminBearer());

        assertThat(response.statusCode()).isEqualTo(400);
        assertThat(response.headers().firstValue(CorrelationFilter.HEADER)).contains("api-version-0001");
        var body = json.readTree(response.body());
        assertThat(body.path("status").asInt()).isEqualTo(400);
        assertThat(text(body, "path")).isEqualTo("/api/v2/users");
    }

    private HttpResponse<String> send(String path, String accept, @Nullable String requestId, @Nullable String token)
            throws IOException, InterruptedException {
        var request = HttpRequest.newBuilder(URI.create("http://localhost:" + port + path))
                .header(HttpHeaders.ACCEPT, accept)
                .GET();
        if (requestId != null) {
            request.header(CorrelationFilter.HEADER, requestId);
        }
        if (token != null) {
            request.header(HttpHeaders.AUTHORIZATION, token);
        }
        return CLIENT.send(request.build(), BodyHandlers.ofString());
    }

    private String adminBearer() {
        var administrator = users.findByEmail("admin@test.local").orElseThrow();
        return "Bearer " + accessTokens.issue(administrator).value();
    }

    private static String text(JsonNode node, String field) {
        return node.path(field).asString();
    }
}
