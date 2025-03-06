# ---------------------------------------
# 1. Build Stage (Maven Compilation)
# ---------------------------------------
FROM maven:3.9.9-eclipse-temurin-23 AS builder

WORKDIR /app

# Copy only pom.xml first to leverage caching for dependencies
COPY pom.xml ./
RUN mvn dependency:go-offline -B --no-transfer-progress

# Copy the full source code and compile (skipping tests)
COPY src ./src
RUN mvn clean package -DskipTests && ls -lh target/

# ---------------------------------------
# 2. MySQL Setup Stage (Required)
# ---------------------------------------
FROM mysql:9.2.0 AS mysql-setup

ENV MYSQL_ROOT_PASSWORD=MYSQL_ROOT_PASSWORD
ENV MYSQL_DATABASE=database

# Copy database initialization script (if needed)
COPY init.sql /docker-entrypoint-initdb.d/

# ---------------------------------------
# 3. Runtime Stage (Final Image)
# ---------------------------------------
FROM eclipse-temurin:23-jre AS runtime

WORKDIR /app

# Create a non-root user for better security
RUN groupadd -r appgroup && useradd -r -g appgroup appuser

# Copy the built Spring Boot JAR from the builder stage
COPY --from=builder /app/target/portfolio-0.8.5.jar app.jar

# Set file permissions and switch to non-root user
RUN chown -R appuser:appgroup /app
USER appuser

# Expose the application's port
EXPOSE 8080

# Run the Spring Boot application
CMD ["java", "-jar", "app.jar"]