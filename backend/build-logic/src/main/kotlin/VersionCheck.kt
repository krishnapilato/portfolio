import org.gradle.api.DefaultTask
import org.gradle.api.GradleException
import org.gradle.api.provider.MapProperty
import org.gradle.api.provider.Property
import org.gradle.api.tasks.Input
import org.gradle.api.tasks.TaskAction
import org.gradle.work.DisableCachingByDefault
import java.net.URI
import java.net.http.HttpClient
import java.net.http.HttpRequest
import java.net.http.HttpResponse

/// Asks Maven Central, the Gradle plugin portal and Gradle itself for their newest stable releases, and fails
/// while any version pinned in the catalog, or the Gradle wrapper, is behind. Everything else follows Spring Boot.
@DisableCachingByDefault(because = "What is newest changes without notice")
abstract class VersionCheck : DefaultTask() {

    @get:Input
    abstract val libraries: MapProperty<String, String>

    @get:Input
    abstract val plugins: MapProperty<String, String>

    @get:Input
    abstract val gradleVersion: Property<String>

    init {
        outputs.upToDateWhen { false }
    }

    @TaskAction
    fun check() {
        val http = HttpClient.newBuilder().followRedirects(HttpClient.Redirect.NORMAL).build()
        fun read(url: String): String {
            val response = http.send(HttpRequest.newBuilder(URI.create(url)).build(), HttpResponse.BodyHandlers.ofString())
            if (response.statusCode() != 200) throw GradleException("$url answered ${response.statusCode()}")
            return response.body()
        }
        fun newest(metadata: String) =
            VERSION.findAll(metadata).map { it.groupValues[1] }.filter(RELEASE::matches).filterNot(PRE_RELEASE::matches).maxWithOrNull(::compare)

        val stale = mutableListOf<String>()
        fun compareWith(name: String, pinned: String, latest: String?) {
            if (latest != null && compare(latest, pinned) > 0) stale += "$name $pinned -> $latest"
        }
        libraries.get().forEach { (module, pinned) ->
            val (group, artifact) = module.split(':', limit = 2)
            compareWith(module, pinned, newest(read("$MAVEN_CENTRAL/${group.replace('.', '/')}/$artifact/maven-metadata.xml")))
        }
        plugins.get().forEach { (id, pinned) ->
            compareWith(id, pinned, newest(read("$PLUGIN_PORTAL/${id.replace('.', '/')}/$id.gradle.plugin/maven-metadata.xml")))
        }
        compareWith("Gradle", gradleVersion.get(), GRADLE_CURRENT.find(read(GRADLE_VERSIONS))?.groupValues?.get(1))

        if (stale.isNotEmpty()) throw GradleException("Updates are available and must be applied:\n  " + stale.joinToString("\n  "))
        logger.lifecycle("All ${libraries.get().size} libraries, ${plugins.get().size} plugins and Gradle are on their latest stable release.")
    }

    companion object {
        private const val MAVEN_CENTRAL = "https://repo.maven.apache.org/maven2"
        private const val PLUGIN_PORTAL = "https://plugins.gradle.org/m2"
        private const val GRADLE_VERSIONS = "https://services.gradle.org/versions/current"
        private val VERSION = Regex("<version>([^<]+)</version>")
        private val GRADLE_CURRENT = Regex("\"version\"\\s*:\\s*\"([^\"]+)\"")
        // A release starts with a number: some artifacts also carry stray names such as v2.4.1.
        private val RELEASE = Regex("\\d[\\w.-]*")
        private val PRE_RELEASE = Regex("(?i).*[.-](alpha|beta|rc|cr|m|ea|preview|snapshot)[.\\d-]*$")
        private val PARTS = Regex("[.-]")

        /// Numeric parts compare as numbers, so 26.10.0 is newer than 26.9.3.
        fun compare(left: String, right: String): Int {
            val a = left.split(PARTS)
            val b = right.split(PARTS)
            for (i in 0 until maxOf(a.size, b.size)) {
                val x = a.getOrElse(i) { "0" }
                val y = b.getOrElse(i) { "0" }
                val order = when {
                    x.all(Char::isDigit) && y.all(Char::isDigit) -> x.toBigInteger().compareTo(y.toBigInteger())
                    else -> x.compareTo(y)
                }
                if (order != 0) return order
            }
            return 0
        }
    }
}
