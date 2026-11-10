plugins {
    id("example.library")
    id("org.springframework.boot")
    id("org.cyclonedx.bom")
    id("com.gorylenko.gradle-git-properties")
}

springBoot {
    buildInfo()
}

gitProperties {
    failOnNoGitDirectory = false
    keys = listOf("git.branch", "git.commit.id", "git.commit.id.abbrev", "git.commit.time", "git.dirty")
}

tasks.jar {
    enabled = false
}

tasks.bootJar {
    archiveFileName = "${project.name}.jar"
}
