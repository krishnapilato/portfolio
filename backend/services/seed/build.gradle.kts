plugins {
    id("example.service")
}

description = "Fills any service with data described in a file: fixed values or Datafaker expressions, through the service's own API"

dependencies {
    implementation(project(":core"))
    implementation("org.springframework.boot:spring-boot-starter-oauth2-client")
    implementation("org.springframework.boot:spring-boot-starter-restclient")
    implementation("com.jayway.jsonpath:json-path")
    implementation("tools.jackson.dataformat:jackson-dataformat-yaml")
    implementation(libs.datafaker)

    testImplementation("org.springframework.boot:spring-boot-starter-webmvc-test")
    testImplementation("org.springframework.boot:spring-boot-starter-security-test")
}
