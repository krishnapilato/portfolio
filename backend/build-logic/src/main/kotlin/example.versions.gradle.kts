val catalog = versionCatalogs.named("libs")

tasks.register<VersionCheck>("dependencyUpdates") {
    description = "Fails when a version in gradle/libs.versions.toml or Gradle itself has a newer stable release."
    group = "help"
    libraries = catalog.libraryAliases.associate { alias ->
        catalog.findLibrary(alias).get().get().let { "${it.group}:${it.name}" to it.versionConstraint.requiredVersion }
    }
    plugins = catalog.pluginAliases.associate { alias ->
        catalog.findPlugin(alias).get().get().let { it.pluginId to it.version.requiredVersion }
    }
    gradleVersion = gradle.gradleVersion
}
