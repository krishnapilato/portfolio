# ---------------------------------------
# 1. Build Stage (Maven Compilation)
# ---------------------------------------
FROM maven:3.9.9-eclipse-temurin-23 AS builder

WORKDIR /app

# Copy only pom.xml first (leveraging caching for dependencies)
COPY pom.xml ./
RUN mvn dependency:go-offline -B --no-transfer-progress

# Copy the actual source code
COPY src ./src

# Compile the application and package it (skipping tests)
RUN mvn clean package -DskipTests && ls -lh target/

# ---------------------------------------
# 2. MySQL Setup Stage (Optional)
# ---------------------------------------
FROM mysql:9.1.0 AS mysql-setup

ENV MYSQL_ROOT_PASSWORD=MYSQL_ROOT_PASSWORD
ENV MYSQL_DATABASE=database

# Copy database schema or data if needed
COPY init.sql /docker-entrypoint-initdb.d/

# ---------------------------------------
# 3. Runtime Stage (Final Image)
# ---------------------------------------
FROM eclipse-temurin:23-jre AS runtime

WORKDIR /app

# Use a non-root user for better security
RUN groupadd -r appgroup && useradd -r -g appgroup appuser

# Copy the JAR from the build stage
COPY --from=builder /app/target/portfolio-0.8.5.jar app.jar

# Set proper permissions
RUN chown -R appuser:appgroup /app
USER appuser

# Expose application port
EXPOSE 8080

# Run the application
CMD ["java", "-jar", "app.jar"]