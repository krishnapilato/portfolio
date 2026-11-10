import net.ltgt.gradle.errorprone.errorprone

plugins {
    java
    jacoco
    pmd
    id("net.ltgt.errorprone")
}

group = "com.example"
version = "1.0.0"

val catalog = versionCatalogs.named("libs")
fun pinned(name: String) = catalog.findVersion(name).get().requiredVersion

val minimumCoverage = "0.90".toBigDecimal()
val mutationScore = 90
val entryPoints = "com.example.*.Application"
val dotenvIgnoredByTests = layout.buildDirectory.file("tests-ignore-dotenv").map { it.asFile.path }
val coverageReport = layout.buildDirectory.file("reports/jacoco/test/jacocoTestReport.xml")
val sharedConfig = rootDir.resolve("config")

java {
    toolchain {
        languageVersion = JavaLanguageVersion.of(pinned("java"))
    }
}

val mutationTool = configurations.dependencyScope("mutationTool")
val mutationToolPath = configurations.resolvable("mutationToolPath") {
    extendsFrom(mutationTool.get())
}
val testRuntime: FileCollection = sourceSets.test.get().runtimeClasspath
val mockitoAgent = provider { testRuntime.files.single { it.name.startsWith("mockito-core-") }.path }

dependencies {
    errorprone(catalog.findLibrary("error-prone-core").get())
    mutationTool(catalog.findLibrary("pitest-command-line").get())
    mutationTool(catalog.findLibrary("pitest-junit5-plugin").get())
}

tasks.withType<JavaCompile>().configureEach {
    options.encoding = "UTF-8"
    // Lombok still reads fields through sun.misc.Unsafe, which Java 27 reports on every compilation.
    options.isFork = true
    options.forkOptions.jvmArgs = listOf("--sun-misc-unsafe-memory-access=allow")
    options.compilerArgs.addAll(listOf("-parameters", "-Xlint:all,-processing", "-Werror"))
    options.errorprone {
        disableWarningsInGeneratedCode = true
        error(
            "UnusedVariable", "UnusedMethod", "UnusedNestedClass", "UnusedLabel", "UnusedTypeParameter",
            "RemoveUnusedImports", "WildcardImport",
        )
    }
}

tasks.test {
    val agent = mockitoAgent
    useJUnitPlatform()
    systemProperty("DOTENV_FILE", dotenvIgnoredByTests.get())
    jvmArgs("-Xshare:off", "--enable-final-field-mutation=ALL-UNNAMED")
    jvmArgumentProviders.add(CommandLineArgumentProvider { listOf("-javaagent:${agent.get()}") })
    finalizedBy(tasks.jacocoTestReport)
}

jacoco {
    toolVersion = pinned("jacoco")
}

val coveredClasses = sourceSets.main.map { main ->
    main.output.asFileTree.matching { exclude("com/example/*/Application.class") }
}

val coverageSummary = tasks.register<Exec>("coverageSummary") {
    description = "Prints the JaCoCo totals next to the coverage gate."
    group = LifecycleBasePlugin.VERIFICATION_GROUP
    inputs.file(coverageReport)
    executable = javaToolchains.launcherFor(java.toolchain).get().executablePath.asFile.path
    args(sharedConfig.resolve("jacoco/CoverageSummary.java").path, coverageReport.get().asFile.path, minimumCoverage)
}

tasks.jacocoTestReport {
    dependsOn(tasks.test)
    classDirectories.setFrom(coveredClasses)
    reports {
        xml.required = true
        html.required = true
    }
    finalizedBy(coverageSummary)
}

tasks.jacocoTestCoverageVerification {
    dependsOn(tasks.jacocoTestReport)
    classDirectories.setFrom(coveredClasses)
    violationRules {
        rule {
            listOf("LINE", "INSTRUCTION", "BRANCH").forEach { counterType ->
                limit {
                    counter = counterType
                    value = "COVEREDRATIO"
                    minimum = minimumCoverage
                }
            }
        }
    }
}

tasks.check {
    dependsOn(tasks.jacocoTestCoverageVerification)
}

val jdkRuntime = javaToolchains.launcherFor(java.toolchain).map { it.metadata.installationPath.file("lib/jrt-fs.jar") }

tasks.withType<Pmd>().configureEach {
    classpath = classpath?.plus(files(jdkRuntime)) ?: files(jdkRuntime)
}

pmd {
    toolVersion = pinned("pmd")
    ruleSets = emptyList()
    ruleSetFiles = files(sharedConfig.resolve("pmd/unused-code.xml"))
    rulesMinimumPriority = 5
    isConsoleOutput = true
}

tasks.register<JavaExec>("mutationTest") {
    description = "Runs PIT and fails when fewer than $mutationScore % of the injected bugs are caught."
    group = LifecycleBasePlugin.VERIFICATION_GROUP
    val main = sourceSets.main.get()
    val sources = main.java.sourceDirectories
    val mutableCode = main.output.classesDirs
    val testClasspath = testRuntime
    val agent = mockitoAgent
    val dotenv = dotenvIgnoredByTests
    val threshold = mutationScore
    val excluded = entryPoints
    val report = layout.buildDirectory.dir("reports/pitest")
    val classPathFile = layout.buildDirectory.file("tmp/mutationTest/classpath.txt")
    dependsOn(tasks.testClasses)
    inputs.files(testClasspath)
    outputs.dir(report)
    classpath = files(mutationToolPath)
    mainClass = "org.pitest.mutationtest.commandline.MutationCoverageReport"
    doFirst {
        classPathFile.get().asFile.apply { parentFile.mkdirs() }.writeText(testClasspath.files.joinToString("\n"))
    }
    argumentProviders.add(CommandLineArgumentProvider {
        listOf(
            "--reportDir", report.get().asFile.path,
            "--targetClasses", "com.example.*",
            "--excludedClasses", "$excluded,com.example.*Configuration",
            "--sourceDirs", sources.files.joinToString(","),
            "--mutableCodePaths", mutableCode.files.joinToString(","),
            "--classPathFile", classPathFile.get().asFile.path,
            "--threads", "4",
            "--timestampedReports=false",
            "--outputFormats", "HTML,XML",
            "--mutationThreshold", threshold.toString(),
            "--jvmArgs", "-javaagent:${agent.get()},-Xshare:off,--enable-final-field-mutation=ALL-UNNAMED,-DDOTENV_FILE=${dotenv.get()}",
        )
    })
}
