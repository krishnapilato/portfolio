plugins {
    id("example.service")
}

description = "In-app notifications, kept in Redis and pushed live to every open session"

dependencies {
    implementation(project(":core"))
    implementation("org.springframework.boot:spring-boot-starter-data-redis")
    implementation(libs.datafaker)

    testImplementation("org.springframework.boot:spring-boot-starter-webmvc-test")
    testImplementation("org.springframework.boot:spring-boot-starter-security-test")
    testImplementation("org.springframework.boot:spring-boot-testcontainers")
    testImplementation("org.testcontainers:testcontainers-junit-jupiter")
    testImplementation("org.awaitility:awaitility")
}
