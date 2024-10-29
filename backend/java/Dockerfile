
FROM maven:3.9.4-eclipse-temurin-21 as builder

WORKDIR /app

COPY pom.xml ./

RUN mvn dependency:go-offline

COPY src ./src

RUN mvn clean package -DskipTests

FROM eclipse-temurin:21-jre

WORKDIR /ap

COPY --from=builder /app/target/*.jar app.jar

EXPOSE 8080

CMD ["java", "-jar", "app.jar"]