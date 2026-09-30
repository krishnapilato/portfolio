FROM amazoncorretto:27-alpine3.24 AS build
WORKDIR /workspace
RUN apk add --no-cache binutils
COPY .mvn .mvn
COPY mvnw pom.xml ./
COPY config config
RUN --mount=type=cache,target=/root/.m2 sh ./mvnw -B -ntp -q dependency:go-offline
COPY src src
ARG GIT_COMMIT=
RUN --mount=type=cache,target=/root/.m2 { [ -z "$GIT_COMMIT" ] || printf 'git.commit.id=%s\n' "$GIT_COMMIT" > src/main/resources/git.properties; } \
 && sh ./mvnw -B -ntp -DskipTests -Djacoco.skip=true -Dpmd.skip=true -Dmaven.gitcommitid.skip=true package \
 && java -Djarmode=tools -jar target/portfolio.jar extract --layers --destination /workspace/app
RUN jlink \
      --add-modules java.base,java.compiler,java.desktop,java.instrument,java.management,java.naming,java.net.http,java.prefs,java.rmi,java.scripting,java.security.jgss,java.security.sasl,java.sql,java.sql.rowset,java.transaction.xa,java.xml,jdk.charsets,jdk.jfr,jdk.management,jdk.naming.dns,jdk.net,jdk.unsupported,jdk.zipfs \
      --strip-debug \
      --no-man-pages \
      --no-header-files \
      --compress=zip-6 \
      --output /opt/jre

FROM alpine:3.24
LABEL org.opencontainers.image.title="Portfolio Platform" \
      org.opencontainers.image.description="Authentication, user management and transactional email for krishnapilato.github.io" \
      org.opencontainers.image.source="https://github.com/krishnapilato/portfolio" \
      org.opencontainers.image.licenses="MIT"
ENV JAVA_HOME=/opt/jre \
    PATH=/opt/jre/bin:$PATH \
    SPRING_PROFILES_ACTIVE=prod
ARG AOT_REQUIRED=false
RUN addgroup -S app && adduser -S -D -H -G app -s /sbin/nologin app
WORKDIR /app
COPY --from=build /opt/jre /opt/jre
COPY --from=build /workspace/app/dependencies/ ./
COPY --from=build /workspace/app/spring-boot-loader/ ./
COPY --from=build /workspace/app/snapshot-dependencies/ ./
COPY --from=build /workspace/app/application/ ./
RUN printf '%s\n' -XX:MaxRAMPercentage=75 -XX:+ExitOnOutOfMemoryError > jvm.options \
 && if java @jvm.options \
        -XX:+UnlockDiagnosticVMOptions -XX:+AOTCompatibleOopCompression -XX:AOTCacheOutput=app.aot \
        -Dspring.context.exit=onRefresh \
        -Dspring.flyway.enabled=false \
        -Dspring.jpa.hibernate.ddl-auto=none \
        -Dspring.jpa.properties.hibernate.boot.allow_jdbc_metadata_access=false \
        -Dspring.jpa.database-platform=org.hibernate.dialect.MySQLDialect \
        -DDB_URL=jdbc:mysql://127.0.0.1:1/training \
        -DDB_USERNAME=training \
        -DDB_PASSWORD=training \
        -DAPP_SECRET=YW90LXRyYWluaW5nLW9ubHktc2VjcmV0LW5ldmVyLXVzZWQtaW4tcnVudGltZSEh \
        -DMAIL_HOST=localhost \
        -DMAIL_PORT=25 \
        -DMAIL_FROM=training@localhost \
        -jar portfolio.jar \
    && [ -s app.aot ]; \
    then echo -XX:AOTCache=app.aot >> jvm.options; \
    else rm -f app.aot app.aot.config; echo "AOT cache training failed: the image will start without a cache"; \
      [ "$AOT_REQUIRED" != true ]; \
    fi
USER app
EXPOSE 8080
HEALTHCHECK --interval=30s --timeout=3s --start-period=60s --start-interval=2s --retries=3 \
    CMD wget -qO- "http://127.0.0.1:${PORT:-8080}/actuator/health/liveness" || exit 1
ENTRYPOINT ["java", "@jvm.options", "-jar", "portfolio.jar"]
