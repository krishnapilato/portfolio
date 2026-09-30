package com.personal.portfolio.system;

import java.time.Instant;
import java.util.Collections;
import java.util.Map;
import java.util.TreeMap;
import org.jspecify.annotations.Nullable;

public record SystemSnapshot(
        Instant capturedAt,
        String status,
        Map<String, String> components,
        Jvm runtime,
        Traffic traffic,
        Domain domain,
        Build build) {

    public SystemSnapshot {
        components = Collections.unmodifiableSortedMap(new TreeMap<>(components));
    }

    public record Jvm(
            String java,
            String vendor,
            long uptimeSeconds,
            long heapUsed,
            long heapMax,
            int threads,
            double cpu,
            int processors) {}

    public record Traffic(long requests, long serverErrors, double meanLatencyMs) {}

    public record Domain(long users, long activeUsers, long mailPending, long mailSent, long mailFailed) {}

    public record Build(String version, @Nullable String commit, @Nullable Instant time) {}
}
