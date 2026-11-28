# syntax=docker/dockerfile:1
# Built from the backend folder: docker build -f services/mail/Dockerfile .

FROM eclipse-temurin:27-jdk-alpine-3.24 AS build
WORKDIR /workspace
COPY --link . .
RUN --mount=type=cache,target=/root/.gradle,sharing=locked     sh ./gradlew --no-daemon --no-configuration-cache :services:mail:bootJar     && java -Djarmode=tools -jar services/mail/build/libs/mail.jar extract --layers --destination /layers

# Only a JRE at runtime: no compiler, no build tools, a smaller image and less to patch.
FROM eclipse-temurin:27-jre-alpine-3.24
RUN adduser -S -D -H -u 10001 app
WORKDIR /application
COPY --link --from=build /layers/dependencies/ ./
COPY --link --from=build /layers/spring-boot-loader/ ./
COPY --link --from=build /layers/snapshot-dependencies/ ./
COPY --link --from=build /layers/application/ ./
USER app
ENTRYPOINT ["java", "-XX:MaxRAMPercentage=75", "-XX:+ExitOnOutOfMemoryError", "-jar", "mail.jar"]
