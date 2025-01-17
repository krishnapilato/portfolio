# Use the latest Maven image with the latest JDK version
FROM maven:latest AS builder

# Set the working directory for the build
WORKDIR /app

# Copy the Maven POM file and download dependencies to leverage caching for faster builds
COPY pom.xml .
RUN mvn dependency:go-offline -B

# Copy the source code to the container
COPY src ./src

# Compile the application and package it, skipping tests to optimize the build process
RUN mvn clean package -DskipTests && ls -l target

# MySQL Setup Stage
FROM mysql:latest AS mysql-setup

# Environment variables for MySQL setup
ENV MYSQL_ROOT_PASSWORD=95Z-5GaYjeCZU%4nV+DdR^2zUqDspg?+kVZbeZQ-ZcYte4^6&Nc*Buzx_8CEHkBV
ENV MYSQL_DATABASE=database

# Preload the database schema or data if needed
COPY init.sql /docker-entrypoint-initdb.d/

# Use the latest Eclipse Temurin JRE image to run the application
FROM eclipse-temurin:latest

# Set the working directory for the runtime environment
WORKDIR /app

# Copy the packaged JAR file from the builder image
COPY --from=builder /app/target/portfolio-0.8.5.jar app.jar

# Expose the port the application will listen on
EXPOSE 8080

# Command to run the application
CMD ["java", "-jar", "app.jar"]