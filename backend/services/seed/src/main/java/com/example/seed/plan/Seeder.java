package com.example.seed.plan;

import module java.base;

import lombok.extern.slf4j.Slf4j;
import net.datafaker.Faker;
import org.jspecify.annotations.Nullable;
import org.springframework.beans.factory.ObjectProvider;
import org.springframework.http.HttpMethod;
import org.springframework.http.MediaType;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.oauth2.client.AuthorizedClientServiceOAuth2AuthorizedClientManager;
import org.springframework.security.oauth2.client.OAuth2AuthorizedClientService;
import org.springframework.security.oauth2.client.registration.ClientRegistrationRepository;
import org.springframework.security.oauth2.client.web.client.OAuth2ClientHttpRequestInterceptor;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestClient;
import org.springframework.web.client.RestClientResponseException;
import tools.jackson.databind.json.JsonMapper;

/// Runs a plan step by step, through the target services' own APIs: each service validates what it receives, so a
/// plan can never put into a database what the service itself would refuse. Every call carries a token Keycloak issued
/// to the `seed` client, unless `seed.use-token` is false; the first failing call stops the run.
@Slf4j
@Service
public class Seeder {

    static final String CLIENT = "seed";

    private final RestClient http;
    private final JsonMapper json;

    Seeder(RestClient.Builder builder, ObjectProvider<ClientRegistrationRepository> registrations,
           ObjectProvider<OAuth2AuthorizedClientService> clients, @Value("${seed.use-token:true}") boolean useToken, JsonMapper json) {
        if (useToken) {
            var tokens = new OAuth2ClientHttpRequestInterceptor(
                new AuthorizedClientServiceOAuth2AuthorizedClientManager(registrations.getObject(), clients.getObject()));
            tokens.setClientRegistrationIdResolver(_ -> CLIENT);
            builder.requestInterceptor(tokens);
        }
        this.http = builder.build();
        this.json = json;
    }

    public Report run(Plan plan, @Nullable Long seed) {
        var faker = seed == null ? new Faker(Locale.ENGLISH) : new Faker(Locale.ENGLISH, new Random(seed));
        var saved = new HashMap<String, Object>();
        var results = new ArrayList<Report.StepResult>();
        for (var step : plan.steps()) {
            var outcome = run(plan, step, faker, saved);
            results.add(outcome);
            if (outcome.error() != null) return new Report(false, results);
        }
        return new Report(true, results);
    }

    private Report.StepResult run(Plan plan, Plan.Step step, Faker faker, Map<String, Object> saved) {
        var base = plan.targets().get(step.target());
        var label = step.method() + " " + step.target() + step.path();
        if (base == null) return Report.StepResult.failed(label, 0, "No target named '%s'".formatted(step.target()));
        for (var index = 1; index <= step.repeat(); index++) {
            try {
                var values = new Values(faker, saved, index);
                var response = call(base, step, values);
                if (step.as() != null && response != null) saved.put(step.as(), response);
            } catch (PlanException | RestClientResponseException e) {
                log.atWarn().addKeyValue("step", label).addKeyValue("repetition", index).log("Seeding stopped");
                return Report.StepResult.failed(label, index - 1, describe(e));
            }
        }
        return Report.StepResult.done(label, step.repeat());
    }

    private @Nullable Object call(URI base, Plan.Step step, Values values) {
        var request = http.method(HttpMethod.valueOf(step.method())).uri(base + values.text(step.path()));
        if (step.body() != null) request = request.contentType(MediaType.APPLICATION_JSON).body(values.fill(step.body()));
        var body = request.retrieve().body(String.class);
        return body == null || body.isBlank() ? null : json.readValue(body, Object.class);
    }

    private static String describe(RuntimeException e) {
        return e instanceof RestClientResponseException response
            ? "The service answered %d: %s".formatted(response.getStatusCode().value(), response.getResponseBodyAsString())
            : e.getMessage();
    }

    public record Report(boolean completed, List<StepResult> steps) {

        public record StepResult(String step, int calls, @Nullable String error) {

            static StepResult done(String step, int calls) {
                return new StepResult(step, calls, null);
            }

            static StepResult failed(String step, int calls, String error) {
                return new StepResult(step, calls, error);
            }
        }
    }
}
