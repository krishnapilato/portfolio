package com.personal.portfolio.system;

import module java.base;

import org.jspecify.annotations.Nullable;
import org.springframework.beans.factory.ObjectProvider;
import org.springframework.boot.SpringBootVersion;
import org.springframework.boot.health.actuate.endpoint.HealthEndpoint;
import org.springframework.boot.info.BuildProperties;
import org.springframework.boot.info.GitProperties;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.GetMapping;

@Controller
class HomeController {

    private static final Duration HEALTH_CACHE = Duration.ofSeconds(10);
    private static final DateTimeFormatter DATE = DateTimeFormatter.ofPattern("d MMM uuuu", Locale.ENGLISH).withZone(ZoneOffset.UTC);

    private final HealthEndpoint health;
    private final Clock clock;
    private final Instant startedAt;
    private final String version;
    private final @Nullable String commit;
    private final @Nullable String built;
    private final String runtime;
    private final AtomicReference<Reading> lastReading = new AtomicReference<>(new Reading("UNKNOWN", Instant.MIN));

    HomeController(HealthEndpoint health, ObjectProvider<BuildProperties> buildInfo, ObjectProvider<GitProperties> gitInfo, Clock clock) {
        var build = Optional.ofNullable(buildInfo.getIfAvailable());
        this.health = health;
        this.clock = clock;
        this.startedAt = clock.instant();
        this.version = build.map(BuildProperties::getVersion).orElse("dev");
        this.commit = Optional.ofNullable(gitInfo.getIfAvailable()).map(GitProperties::getShortCommitId).orElse(null);
        this.built = build.map(BuildProperties::getTime).map(DATE::format).orElse(null);
        this.runtime = "Java %d · Spring Boot %s".formatted(Runtime.version().feature(), SpringBootVersion.getVersion());
    }

    static String uptime(Duration duration) {
        if (duration.toDays() > 0) return duration.toDays() + " d " + duration.toHoursPart() + " h";
        if (duration.toHours() > 0) return duration.toHours() + " h " + duration.toMinutesPart() + " min";
        return Math.max(1, duration.toMinutes()) + " min";
    }

    @GetMapping("/")
    String home(Model model) {
        model.addAttribute("status", status());
        model.addAttribute("uptime", uptime(Duration.between(startedAt, clock.instant())));
        model.addAttribute("version", version);
        model.addAttribute("commit", commit);
        model.addAttribute("built", built);
        model.addAttribute("runtime", runtime);
        return "home";
    }

    private String status() {
        var now = clock.instant();
        var reading = lastReading.get();
        if (!now.isBefore(reading.takenAt().plus(HEALTH_CACHE))) {
            reading = new Reading(health.health().getStatus().getCode(), now);
            lastReading.set(reading);
        }
        return reading.status();
    }

    private record Reading(String status, Instant takenAt) { }
}
