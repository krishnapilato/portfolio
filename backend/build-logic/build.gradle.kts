import org.jetbrains.kotlin.gradle.dsl.JvmTarget

plugins {
    `kotlin-dsl`
}

// Kotlin cannot target Java 27 yet; the build logic targets the newest release both compilers support.
java {
    targetCompatibility = JavaVersion.VERSION_26
}

kotlin {
    compilerOptions {
        jvmTarget = JvmTarget.JVM_26
    }
}

fun plugin(dependency: Provider<PluginDependency>) =
    dependency.map { "${it.pluginId}:${it.pluginId}.gradle.plugin:${it.version}" }

dependencies {
    implementation(plugin(libs.plugins.spring.boot))
    implementation(plugin(libs.plugins.cyclonedx))
    implementation(plugin(libs.plugins.git.properties))
    implementation(plugin(libs.plugins.error.prone))
}
