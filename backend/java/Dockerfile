FROM amazoncorretto:27-alpine3.24 AS build
WORKDIR /workspace
COPY . .
RUN --mount=type=cache,target=/root/.m2 sh ./mvnw -B -ntp package -DskipTests -Dpmd.skip=true

FROM amazoncorretto:27-alpine3.24
RUN adduser -S -D -H -u 10001 app
COPY --from=build /workspace/target/portfolio.jar /app.jar
USER app
ENV SPRING_PROFILES_ACTIVE=prod
EXPOSE 8080
ENTRYPOINT ["java", "-XX:MaxRAMPercentage=75", "-XX:+ExitOnOutOfMemoryError", "-jar", "/app.jar"]
