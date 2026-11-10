plugins {
    id("example.service")
}

description = "Transactional mail and newsletters with dynamic templates"

dependencies {
    implementation(project(":core"))
    implementation(platform(libs.spring.modulith.bom))
    implementation("org.springframework.boot:spring-boot-starter-mail")
    implementation("org.springframework.boot:spring-boot-starter-data-jpa")
    implementation("org.springframework.boot:spring-boot-starter-flyway")
    implementation("org.springframework.modulith:spring-modulith-starter-jdbc")
    implementation("org.flywaydb:flyway-mysql")
    implementation("com.samskivert:jmustache")
    implementation(libs.datafaker)
    runtimeOnly(libs.mysql.connector)

    testImplementation(platform(libs.spring.modulith.bom))
    testImplementation("org.springframework.boot:spring-boot-starter-webmvc-test")
    testImplementation("org.springframework.boot:spring-boot-starter-security-test")
    testImplementation("org.springframework.boot:spring-boot-starter-data-jpa-test")
    testImplementation("org.springframework.boot:spring-boot-testcontainers")
    testImplementation("org.testcontainers:testcontainers-mysql")
    testImplementation("org.testcontainers:testcontainers-junit-jupiter")
    testImplementation("org.springframework.modulith:spring-modulith-starter-test")
    testImplementation("org.awaitility:awaitility")
}
