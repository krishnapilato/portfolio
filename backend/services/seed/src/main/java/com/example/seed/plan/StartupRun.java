package com.example.seed.plan;

import module java.base;

import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.ApplicationArguments;
import org.springframework.boot.ApplicationRunner;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.core.io.Resource;
import org.springframework.stereotype.Component;

/// With `seed.file` set, the plan in that file runs once when the service starts, for example to fill a fresh
/// environment before anyone uses it. A plan that does not complete stops the service, so the failure is seen.
@Slf4j
@Component
@ConditionalOnProperty("seed.file")
class StartupRun implements ApplicationRunner {

    private final Plans plans;
    private final Seeder seeder;
    private final Resource file;

    StartupRun(Plans plans, Seeder seeder, @Value("${seed.file}") Resource file) {
        this.plans = plans;
        this.seeder = seeder;
        this.file = file;
    }

    @Override
    public void run(ApplicationArguments arguments) throws IOException {
        var report = seeder.run(plans.read(file.getContentAsString(StandardCharsets.UTF_8)), null);
        report.steps().forEach(step -> log.atInfo().addKeyValue("calls", step.calls()).addKeyValue("error", step.error())
            .log("Seeded {}", step.step()));
        if (!report.completed()) throw new IllegalStateException("The plan in " + file.getDescription() + " did not complete");
    }
}
