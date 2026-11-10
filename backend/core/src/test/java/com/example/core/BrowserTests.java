package com.example.core;

import module java.base;
import module java.net.http;
import static org.assertj.core.api.Assertions.assertThat;

import com.example.core.support.TestApplication;
import org.junit.jupiter.api.Test;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.test.context.SpringBootTest.WebEnvironment;
import org.springframework.boot.test.web.server.LocalServerPort;

/// Over real HTTP, because only a servlet container renders an error page after `sendError`.
@SpringBootTest(classes = TestApplication.class, webEnvironment = WebEnvironment.RANDOM_PORT)
class BrowserTests {

    private static final HttpClient CLIENT = HttpClient.newHttpClient();

    @LocalServerPort
    private int port;

    @Test
    void showsABrowserTheErrorPageWhenItIsNotSignedIn() throws Exception {
        var response = get("/probe/items/lamp", "text/html,application/xhtml+xml");

        assertThat(response.statusCode()).isEqualTo(401);
        assertThat(response.headers().firstValue("WWW-Authenticate")).hasValueSatisfying(value -> assertThat(value).startsWith("Bearer"));
        assertThat(response.body()).contains("<title>401 · Example service</title>", "Back to the start");
    }

    @Test
    void givesAnApiClientTheChallengeWithoutAPage() throws Exception {
        var response = get("/probe/items/lamp", "application/json");

        assertThat(response.statusCode()).isEqualTo(401);
        assertThat(response.headers().firstValue("WWW-Authenticate")).hasValueSatisfying(value -> assertThat(value).startsWith("Bearer"));
        assertThat(response.body()).doesNotContain("<html");
    }

    @Test
    void treatsAClientThatAcceptsAnythingAsAnApiClient() throws Exception {
        assertThat(get("/probe/items/lamp", "*/*").body()).doesNotContain("<html");
    }

    private HttpResponse<String> get(String path, String accept) throws Exception {
        var request = HttpRequest.newBuilder(URI.create("http://localhost:%d%s".formatted(port, path))).header("Accept", accept).build();
        return CLIENT.send(request, HttpResponse.BodyHandlers.ofString());
    }
}
