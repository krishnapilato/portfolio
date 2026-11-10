import org.springframework.boot.gradle.plugin.SpringBootPlugin

plugins {
    id("example.quality")
    `java-library`
}

dependencies {
    api(platform(SpringBootPlugin.BOM_COORDINATES))
    annotationProcessor(platform(SpringBootPlugin.BOM_COORDINATES))

    compileOnly("org.projectlombok:lombok")
    annotationProcessor("org.projectlombok:lombok")
    annotationProcessor("org.springframework.boot:spring-boot-configuration-processor")

    testRuntimeOnly("org.junit.platform:junit-platform-launcher")
}
