# Stage 1: build the jar. The cache mount keeps downloaded Maven dependencies between builds.
FROM amazoncorretto:27-alpine3.24 AS build
WORKDIR /workspace
COPY .mvn .mvn
COPY mvnw pom.xml ./
COPY config config
COPY src src
RUN --mount=type=cache,target=/root/.m2 sh ./mvnw -B -ntp package -DskipTests -Dpmd.skip=true

# Stage 2: run it. Only the jar is copied over, and it runs as an unprivileged user.
FROM amazoncorretto:27-alpine3.24
RUN addgroup -S -g 10001 app && adduser -S -D -H -u 10001 -G app app
WORKDIR /app
COPY --from=build /workspace/target/portfolio.jar app.jar
USER 10001:10001
ENV SPRING_PROFILES_ACTIVE=prod
EXPOSE 8080
HEALTHCHECK --interval=30s --timeout=3s --start-period=60s \
    CMD wget -qO- http://127.0.0.1:8080/actuator/health/liveness || exit 1
# Size the heap from the container's memory limit, and let the orchestrator restart us after an out-of-memory error.
ENTRYPOINT ["java", "-XX:MaxRAMPercentage=75", "-XX:+ExitOnOutOfMemoryError", "-jar", "app.jar"]
