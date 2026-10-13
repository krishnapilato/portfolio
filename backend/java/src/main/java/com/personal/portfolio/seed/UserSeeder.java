package com.personal.portfolio.seed;

import module java.base;

import com.personal.portfolio.mail.MailAddress;
import com.personal.portfolio.platform.AppProperties;
import com.personal.portfolio.security.StrongPassword;
import com.personal.portfolio.user.AccountStatus;
import com.personal.portfolio.user.Role;
import com.personal.portfolio.user.User;
import com.personal.portfolio.user.UserRepository;
import jakarta.validation.Validator;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
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
    @Transactional(rollbackFor = Exception.class)
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
        var invalid = validator.validate(seed).stream().map(violation -> violation.getPropertyPath().toString()).distinct().sorted().toList();
        if (!invalid.isEmpty())
            throw new IllegalStateException("Seed user %s has an invalid %s".formatted(seed.email(), String.join(", ", invalid)));
        var passwordHash = Objects.requireNonNull(passwordEncoder.encode(seed.password()));
        return User.register(seed.fullName(), seed.email(), passwordHash, seed.role(), AccountStatus.ACTIVE);
    }

    record SeedUser(@NotBlank String fullName, @NotBlank @MailAddress String email, @NotNull Role role, @StrongPassword String password) {

        SeedUser resolve(UnaryOperator<String> placeholders) {
            return new SeedUser(placeholders.apply(fullName), User.normalizeEmail(placeholders.apply(email)), role, placeholders.apply(password));
        }

        @Override
        public String toString() {
            return "SeedUser[fullName=%s, email=%s, role=%s, password=<redacted>]".formatted(fullName, email, role);
        }
    }
}
