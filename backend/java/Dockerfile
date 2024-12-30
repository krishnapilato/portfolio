# Use Maven with Eclipse Temurin 23 JDK to build the application
FROM maven:3.9.9-eclipse-temurin-23 AS builder

# Set the working directory for the build
WORKDIR /app

# Copy the Maven POM file and download dependencies to leverage caching for faster builds
COPY pom.xml . 
RUN mvn dependency:go-offline -B  # -B for non-interactive mode, helpful for CI/CD

# Copy the source code to the container
COPY src ./src

# Compile the application and package it, skipping tests to optimize the build process
RUN mvn clean package -DskipTests

# Use Eclipse Temurin 23 JRE to run the application
FROM eclipse-temurin:23-jre

# Set the working directory for the runtime environment
WORKDIR /app

# Copy the packaged JAR file from the builder image
COPY --from=builder /app/target/*.jar app.jar

# Expose the port the application will listen on
EXPOSE 8080

# Command to run the application
CMD ["java", "-jar", "app.jar"]