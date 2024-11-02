# Using Maven 3.9.9 with a specific version of the Eclipse Temurin JDK
FROM maven:3.9.9-eclipse-temurin-21 as builder

WORKDIR /app

# Copy the project's pom.xml and resolve all dependencies.
# This layer will be cached unless the pom.xml changes.
COPY pom.xml ./
RUN mvn dependency:go-offline

# Copy the source code into the image
COPY src ./src

# Build the application without running tests to speed up the process
RUN mvn clean package -DskipTests

# Use the version of Eclipse Temurin JRE that matches the JDK version used for building
FROM eclipse-temurin:21-jre

WORKDIR /app

# Copy the built jar file from the previous stage
COPY --from=builder /app/target/*.jar app.jar

EXPOSE 8080

# Command to run the application
CMD ["java", "-jar", "app.jar"]