package com.personal.portfolio.auth;

import static org.assertj.core.api.Assertions.assertThat;

import com.personal.portfolio.support.IntegrationTest;
import java.io.IOException;
import java.net.URI;
import java.net.http.HttpClient;
import java.net.http.HttpRequest.BodyPublishers;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse.BodyHandlers;
import java.util.ArrayList;
import org.junit.jupiter.api.AfterAll;
import org.junit.jupiter.api.Test;
import org.springframework.boot.test.context.SpringBootTest.WebEnvironment;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.test.web.server.LocalServerPort;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.test.context.TestPropertySource;

@SpringBootTest(webEnvironment = WebEnvironment.RANDOM_PORT)
@TestPropertySource(properties = {
        "app.security.auth-requests-per-minute=3",
        "spring.datasource.url=jdbc:h2:mem:forwarded-for;MODE=MySQL;DATABASE_TO_LOWER=TRUE;DB_CLOSE_DELAY=-1"})
class ForwardedForTests extends IntegrationTest {

    private static final HttpClient CLIENT = HttpClient.newBuilder().version(HttpClient.Version.HTTP_1_1).build();
    private static final String WRONG_LOGIN = """
            {"email":"nobody@example.test","password":"Wrong-Passw0rd"}""";

    @LocalServerPort
    private int port;

    @AfterAll
    static void closeClient() {
        CLIENT.close();
    }

    @Test
    void ignoresForwardedForHeadersFromUntrustedClients() throws Exception {
        var statuses = new ArrayList<Integer>();
        for (var attempt = 1; attempt <= 4; attempt++) {
            statuses.add(login("203.0.113." + attempt));
        }

        assertThat(statuses).containsExactly(401, 401, 401, 429);
    }

    private int login(String spoofedAddress) throws IOException, InterruptedException {
        var request = HttpRequest.newBuilder(URI.create("http://localhost:" + port + "/api/v1/auth/login"))
                .header(HttpHeaders.CONTENT_TYPE, MediaType.APPLICATION_JSON_VALUE)
                .header("X-Forwarded-For", spoofedAddress)
                .POST(BodyPublishers.ofString(WRONG_LOGIN))
                .build();
        return CLIENT.send(request, BodyHandlers.discarding()).statusCode();
    }
}
