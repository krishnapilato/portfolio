package com.personal.portfolio.user;

import com.personal.portfolio.auth.TokenPurpose;
import com.personal.portfolio.auth.TokenVault;
import com.personal.portfolio.platform.ApiException;
import com.personal.portfolio.platform.Pageables;
import com.personal.portfolio.platform.Problem.EmailTaken;
import com.personal.portfolio.platform.Problem.LastAdministrator;
import com.personal.portfolio.platform.Problem.NotFound;
import com.personal.portfolio.platform.Problem.SelfManagement;
import com.personal.portfolio.platform.Tally;
import com.personal.portfolio.user.UserPayloads.CreateUser;
import com.personal.portfolio.user.UserPayloads.UpdateUser;
import com.personal.portfolio.user.UserPayloads.UserStats;
import com.personal.portfolio.user.UserPayloads.UserView;
import jakarta.validation.constraints.Size;
import java.util.Locale;
import java.util.Objects;
import java.util.Set;
import java.util.regex.Pattern;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.jspecify.annotations.Nullable;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Slf4j
@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
class UserService {

    private static final Set<String> SORTABLE = Set.of("createdAt", "updatedAt", "fullName", "email", "lastLoginAt", "status", "role");

    private final UserRepository users;
    private final TokenVault vault;
    private final PasswordEncoder passwordEncoder;

    private static void requireOther(long id, long actorId) {
        if (id == actorId) throw new ApiException(new SelfManagement());
    }

    Page<UserView> search(Criteria criteria, Pageable pageable) {
        var sorted = Pageables.restrict(pageable, SORTABLE);
        return users.search(criteria.pattern(), criteria.role(), criteria.status(), sorted).map(UserView::of);
    }

    UserStats stats() {
        var byStatus = Tally.zeroFilled(AccountStatus.class, users.tallyByStatus());
        var byRole = Tally.zeroFilled(Role.class, users.tallyByRole());
        var total = byStatus.values().stream().mapToLong(Long::longValue).sum();
        return new UserStats(total, byStatus, byRole);
    }

    UserView get(long id) {
        return UserView.of(find(id));
    }

    @Transactional
    UserView create(CreateUser request, long actorId) {
        var email = User.normalizeEmail(request.email());
        if (users.existsByEmail(email)) throw new ApiException(new EmailTaken(email));
        var passwordHash = Objects.requireNonNull(passwordEncoder.encode(request.password()));
        var user = users.save(User.register(request.fullName(), email, passwordHash, request.role(), AccountStatus.ACTIVE));
        log.info("Admin {} created user {} with role {}", actorId, user.getId(), user.getRole());
        return UserView.of(user);
    }

    @Transactional
    UserView update(long id, UpdateUser request, long actorId) {
        var user = find(id);
        var role = request.role();
        if (role != null && role != user.getRole()) {
            requireOther(id, actorId);
            keepAnAdministrator(user);
            log.info("Admin {} changed the role of user {} from {} to {}", actorId, id, user.getRole(), role);
            user.assignRole(role);
        }
        var fullName = request.fullName();
        if (fullName != null) user.rename(fullName);
        return flushed(user);
    }

    @Transactional
    UserView changeStatus(long id, AccountStatus target, long actorId) {
        requireOther(id, actorId);
        var user = find(id);
        if (target != AccountStatus.ACTIVE) keepAnAdministrator(user);
        var previous = user.getStatus();
        user.transitionTo(target);
        if (previous != target) {
            var revoked = previous == AccountStatus.ACTIVE ? vault.revoke(user, TokenPurpose.REFRESH) : 0;
            log.info("Admin {} moved user {} from {} to {} ({} refresh tokens revoked)",
                actorId, id, previous, target, revoked);
        }
        return flushed(user);
    }

    @Transactional
    void delete(long id, long actorId) {
        requireOther(id, actorId);
        var user = find(id);
        keepAnAdministrator(user);
        users.delete(user);
        log.info("Admin {} deleted user {}", actorId, id);
    }

    private User find(long id) {
        return users.findById(id).orElseThrow(() -> new ApiException(new NotFound("user", id)));
    }

    private UserView flushed(User user) {
        users.flush();
        return UserView.of(user);
    }

    private void keepAnAdministrator(User user) {
        if (user.getRole() == Role.ADMIN && user.getStatus() == AccountStatus.ACTIVE
            && users.findByRoleAndStatus(Role.ADMIN, AccountStatus.ACTIVE).size() < 2) {
            throw new ApiException(new LastAdministrator());
        }
    }

    record Criteria(@Nullable @Size(max = 100) String q, @Nullable Role role, @Nullable AccountStatus status) {

        private static final Pattern LIKE_METACHARACTER = Pattern.compile("[!%_]");

        @Nullable String pattern() {
            if (q == null || q.isBlank()) return null;
            return "%" + LIKE_METACHARACTER.matcher(q.strip().toLowerCase(Locale.ROOT)).replaceAll("!$0") + "%";
        }
    }
}
