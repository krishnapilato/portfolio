package com.personal.portfolio.seed;

import com.personal.portfolio.platform.AppProperties;
import com.personal.portfolio.security.StrongPassword;
import com.personal.portfolio.user.AccountStatus;
import com.personal.portfolio.user.Role;
import com.personal.portfolio.user.User;
import com.personal.portfolio.user.UserRepository;
import jakarta.validation.Validator;
import java.io.IOException;
import java.util.HashSet;
import java.util.List;
import java.util.Objects;
import java.util.function.UnaryOperator;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.ApplicationArguments;
import org.springframework.boot.ApplicationRunner;
import org.springframework.boot.autoconfigure.condition.ConditionalOnBooleanProperty;
import org.springframework.core.env.Environment;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;
import tools.jackson.core.type.TypeReference;
import tools.jackson.databind.json.JsonMapper;

/// Creates the users listed in seed/users.json on startup. The file holds only ${...} placeholders,
/// so real emails and passwords come from the environment; users that already exist are left alone.
@Slf4j
@Component
@RequiredArgsConstructor
@ConditionalOnBooleanProperty("app.seed.enabled")
class UserSeeder implements ApplicationRunner {

    private static final TypeReference<List<SeedUser>> SEED_USERS = new TypeReference<>() {};

    private final AppProperties properties;
    private final JsonMapper mapper;
    private final Environment environment;
    private final UserRepository users;
    private final PasswordEncoder passwordEncoder;
    private final Validator validator;

    @Override
    @Transactional
    public void run(ApplicationArguments arguments) throws IOException {
        var seeds = read();
        var emails = new HashSet<String>();
        var fresh = seeds.stream()
                .map(seed -> seed.resolve(environment::resolveRequiredPlaceholders))
                .filter(seed -> emails.add(seed.email()) && !users.existsByEmail(seed.email()))
                .map(this::register)
                .toList();
        users.saveAll(fresh);
        log.info("Seeded {} of {} users", fresh.size(), seeds.size());
    }

    private List<SeedUser> read() throws IOException {
        try (var json = properties.seed().users().getInputStream()) {
            return mapper.readValue(json, SEED_USERS);
        }
    }

    private User register(SeedUser seed) {
        if (!validator.validate(seed).isEmpty()) {
            throw new IllegalStateException(
                    "Seed password for " + seed.email() + " does not satisfy the password policy");
        }
        var passwordHash = Objects.requireNonNull(passwordEncoder.encode(seed.password()));
        return User.register(seed.fullName(), seed.email(), passwordHash, seed.role(), AccountStatus.ACTIVE);
    }

    record SeedUser(String fullName, String email, Role role, @StrongPassword String password) {

        SeedUser resolve(UnaryOperator<String> placeholders) {
            return new SeedUser(
                    placeholders.apply(fullName),
                    User.normalizeEmail(placeholders.apply(email)),
                    role,
                    placeholders.apply(password));
        }

        @Override
        public String toString() {
            return "SeedUser[fullName=%s, email=%s, role=%s, password=<redacted>]".formatted(fullName, email, role);
        }
    }
}
