import module java.net.http;

import java.awt.Desktop;

static final URI ARCHIVE = URI.create("https://codeload.github.com/krishnapilato/portfolio/zip/refs/heads/main");
static final String ARCHIVE_PREFIX = "portfolio-main/backend/java/";
static final Path CHECKOUT = Path.of("portfolio-main", "backend", "java");
static final String PLACEHOLDER = "change-me";
static final String ALPHABET = "ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz23456789";
static final Pattern STRONG_PASSWORD = Pattern.compile("(?=.*[a-z])(?=.*[A-Z])(?=.*\\d).{16,}");
static final int SECRET_BYTES = 48;
static final int MINIMUM_SECRET_BYTES = 32;
static final SecureRandom RANDOM = new SecureRandom();
static final List<Link> LINKS = List.of(
        new Link("Platform", "http://localhost:8080"),
        new Link("API docs", "http://localhost:8080/swagger-ui.html"),
        new Link("Actuator", "http://localhost:8080/actuator"),
        new Link("Mailpit", "http://localhost:8025"));
static final String USAGE = """
        Usage: java launch.java [command]

        Commands:
          up       build and start MySQL, Mailpit and the platform (default)
          down     stop and remove the containers, keeping the database volume
          logs     follow the platform logs
          status   list the containers and their health
        """;

record Link(String label, String url) {}

static final class Abort extends Exception {

    @Serial
    private static final long serialVersionUID = 1L;

    Abort(String message) {
        super(message, null, false, false);
    }
}

final boolean ansi = System.console() != null && System.getenv("NO_COLOR") == null;

void main(String[] args) {
    var command = args.length == 0 ? "up" : args[0].strip().toLowerCase(Locale.ROOT);
    int exitCode;
    try {
        exitCode = switch (command) {
            case "up" -> up();
            case "down" -> compose(project(), "down");
            case "logs" -> compose(project(), "logs", "--follow", "app");
            case "status" -> compose(project(), "ps");
            case "help", "-h", "--help" -> {
                IO.print(USAGE);
                yield 0;
            }
            default -> {
                fail("Unknown command '" + command + "'");
                System.err.print(USAGE);
                yield 2;
            }
        };
    } catch (Abort e) {
        exitCode = fail(e.getMessage());
    } catch (InterruptedException _) {
        Thread.currentThread().interrupt();
        exitCode = fail("Interrupted");
    } catch (IOException | RuntimeException e) {
        exitCode = fail(Objects.requireNonNullElse(e.getMessage(), e.getClass().getSimpleName()));
    }
    System.exit(exitCode);
}

int up() throws Abort, IOException, InterruptedException {
    requireDocker();
    var located = locate();
    var project = located.isPresent() ? located.get() : download();
    step("Using project " + project);
    var environment = prepareEnvironment(project);
    step("Building and starting the stack, the first build takes a few minutes");
    int exitCode = compose(project, "up", "--build", "--detach", "--wait");
    if (exitCode != 0) {
        fail("docker compose up failed with exit code " + exitCode
                + ". Inspect it with 'java launch.java logs'; after changing DB_PASSWORD reset the volume with 'docker compose down -v'");
        return exitCode;
    }
    summarize(environment);
    browse(URI.create(LINKS.getFirst().url()));
    return 0;
}

void requireDocker() throws Abort, InterruptedException {
    step("Checking Docker");
    if (run(quiet("docker", "info")) != 0) {
        throw new Abort("Docker is not running. Start Docker Desktop or the Docker daemon and try again");
    }
    if (run(quiet("docker", "compose", "version")) != 0) {
        throw new Abort("Docker Compose v2 is required: https://docs.docker.com/compose/install/");
    }
}

int compose(Path project, String... arguments) throws Abort, InterruptedException {
    var command = new ArrayList<>(List.of("docker", "compose"));
    command.addAll(List.of(arguments));
    return run(new ProcessBuilder(command).directory(project.toFile()).inheritIO());
}

ProcessBuilder quiet(String... command) {
    return new ProcessBuilder(command).redirectErrorStream(true).redirectOutput(ProcessBuilder.Redirect.DISCARD);
}

int run(ProcessBuilder process) throws Abort, InterruptedException {
    try {
        return process.start().waitFor();
    } catch (IOException _) {
        throw new Abort("Cannot run '" + process.command().getFirst()
                + "'. Install Docker and make sure it is on the PATH: https://docs.docker.com/get-docker/");
    }
}

Optional<Path> locate() {
    var here = Path.of("").toAbsolutePath().normalize();
    return Stream.of(here, here.resolve("backend").resolve("java"), here.resolve(CHECKOUT))
            .filter(directory -> Files.isRegularFile(directory.resolve("compose.yaml"))
                    && Files.isRegularFile(directory.resolve("pom.xml")))
            .findFirst();
}

Path project() throws Abort {
    return locate().orElseThrow(() -> new Abort("No Portfolio project found here. Run 'java launch.java up' first"));
}

Path download() throws Abort, IOException, InterruptedException {
    step("Downloading " + ARCHIVE);
    var archive = Files.createTempFile("portfolio-", ".zip");
    try (var http = HttpClient.newBuilder()
            .followRedirects(HttpClient.Redirect.NORMAL)
            .connectTimeout(Duration.ofSeconds(20))
            .build()) {
        var request = HttpRequest.newBuilder(ARCHIVE).header("User-Agent", "portfolio-launcher").GET().build();
        var response = http.send(request, HttpResponse.BodyHandlers.ofFile(archive));
        if (response.statusCode() != 200) {
            throw new Abort("Download failed with HTTP status " + response.statusCode());
        }
        var root = Path.of("").toAbsolutePath().normalize();
        int files = extract(archive, root);
        success(String.format(Locale.ROOT, "Extracted %d files from a %.1f MB archive into %s",
                files, Files.size(archive) / 1_048_576.0, root.resolve(CHECKOUT)));
    } finally {
        Files.deleteIfExists(archive);
    }
    return locate().orElseThrow(() -> new Abort("The downloaded archive does not contain backend/java"));
}

int extract(Path archive, Path root) throws Abort, IOException {
    int files = 0;
    try (var zip = new ZipFile(archive.toFile())) {
        for (var entry : zip.stream().filter(candidate -> candidate.getName().startsWith(ARCHIVE_PREFIX)).toList()) {
            var target = root.resolve(entry.getName()).normalize();
            if (!target.startsWith(root)) {
                throw new Abort("Refusing to extract '" + entry.getName() + "' outside " + root);
            }
            if (entry.isDirectory()) {
                Files.createDirectories(target);
                continue;
            }
            Files.createDirectories(target.getParent());
            try (var content = zip.getInputStream(entry)) {
                Files.copy(content, target, StandardCopyOption.REPLACE_EXISTING);
            }
            files++;
        }
    }
    return files;
}

Map<String, String> prepareEnvironment(Path project) throws Abort, IOException {
    var file = project.resolve(".env");
    if (Files.exists(file)) {
        step("Using existing " + file);
    } else {
        var template = project.resolve(".env.example");
        if (!Files.isRegularFile(template)) {
            throw new Abort("Missing " + template);
        }
        Files.write(file, Files.readAllLines(template).stream().map(this::withGeneratedSecret).toList());
        restrictToOwner(file);
        success("Created " + file + " with freshly generated secrets");
    }
    var environment = Files.readAllLines(file).stream()
            .map(this::assignment)
            .flatMap(Optional::stream)
            .collect(Collectors.toMap(Map.Entry::getKey, Map.Entry::getValue, (_, last) -> last));
    if (!usableSecret(environment.getOrDefault("APP_SECRET", ""))) {
        throw new Abort("APP_SECRET in " + file + " must be the base64 encoding of at least "
                + MINIMUM_SECRET_BYTES + " random bytes. Delete the file to generate a fresh one");
    }
    if (environment.containsValue(PLACEHOLDER)) {
        warn(file + " still contains '" + PLACEHOLDER + "' placeholders");
    }
    return environment;
}

Optional<Map.Entry<String, String>> assignment(String line) {
    int separator = line.indexOf('=');
    if (separator <= 0 || line.stripLeading().startsWith("#")) {
        return Optional.empty();
    }
    return Optional.of(Map.entry(line.substring(0, separator).strip(), line.substring(separator + 1).strip()));
}

String withGeneratedSecret(String line) {
    return assignment(line)
            .filter(entry -> entry.getValue().equals(PLACEHOLDER))
            .map(entry -> entry.getKey() + "=" + generate(entry.getKey()))
            .orElse(line);
}

String generate(String key) {
    return switch (key) {
        case "APP_SECRET" -> {
            var secret = new byte[SECRET_BYTES];
            RANDOM.nextBytes(secret);
            yield Base64.getEncoder().encodeToString(secret);
        }
        default -> password();
    };
}

String password() {
    return Stream.generate(() -> RANDOM.ints(20, 0, ALPHABET.length())
                    .collect(StringBuilder::new, (text, index) -> text.append(ALPHABET.charAt(index)), StringBuilder::append)
                    .toString())
            .filter(candidate -> STRONG_PASSWORD.matcher(candidate).matches())
            .findFirst()
            .orElseThrow();
}

boolean usableSecret(String secret) {
    try {
        return Base64.getDecoder().decode(secret).length >= MINIMUM_SECRET_BYTES;
    } catch (IllegalArgumentException _) {
        return false;
    }
}

void restrictToOwner(Path file) throws IOException {
    if (Files.getFileStore(file).supportsFileAttributeView(PosixFileAttributeView.class)) {
        Files.setPosixFilePermissions(file, PosixFilePermissions.fromString("rw-------"));
    }
}

void summarize(Map<String, String> environment) {
    IO.println("");
    IO.println(paint("1;32", "  Portfolio Platform is up and healthy"));
    IO.println("");
    LINKS.forEach(link -> row(link.label(), paint("36", link.url())));
    if (Boolean.parseBoolean(environment.get("SEED_ENABLED"))) {
        row("Admin", environment.getOrDefault("SEED_ADMIN_EMAIL", "") + " / " + environment.getOrDefault("SEED_ADMIN_PASSWORD", ""));
    }
    IO.println("");
    IO.println("  Stop it with 'java launch.java down', follow the logs with 'java launch.java logs'");
    IO.println("");
}

void row(String label, String value) {
    IO.println("  " + paint("1", "%-10s".formatted(label)) + value);
}

void browse(URI uri) {
    try {
        if (Desktop.isDesktopSupported() && Desktop.getDesktop().isSupported(Desktop.Action.BROWSE)) {
            Desktop.getDesktop().browse(uri);
            return;
        }
        var os = System.getProperty("os.name", "").toLowerCase(Locale.ROOT);
        var command = os.startsWith("windows") ? List.of("cmd", "/c", "start", "", uri.toString())
                : os.startsWith("mac") ? List.of("open", uri.toString())
                : List.of("xdg-open", uri.toString());
        quiet(command.toArray(String[]::new)).start();
    } catch (IOException | RuntimeException _) {
        IO.println("  Open " + uri + " in your browser");
    }
}

String paint(String style, String text) {
    return ansi ? "\u001B[" + style + "m" + text + "\u001B[0m" : text;
}

void step(String message) {
    IO.println(paint("1;36", "==> ") + message);
}

void success(String message) {
    IO.println(paint("1;32", " ok ") + message);
}

void warn(String message) {
    System.err.println(paint("1;33", "  ! ") + message);
}

int fail(String message) {
    System.err.println(paint("1;31", "  x ") + message);
    return 1;
}
