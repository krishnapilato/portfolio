package com.personal.portfolio.user;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.assertj.core.api.Assertions.entry;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.BDDMockito.given;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.times;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.verifyNoInteractions;

import com.personal.portfolio.auth.TokenPurpose;
import com.personal.portfolio.auth.TokenVault;
import com.personal.portfolio.platform.ApiException;
import com.personal.portfolio.platform.Problem;
import com.personal.portfolio.platform.Problem.EmailTaken;
import com.personal.portfolio.platform.Problem.LastAdministrator;
import com.personal.portfolio.platform.Problem.NotFound;
import com.personal.portfolio.platform.Problem.SelfManagement;
import com.personal.portfolio.platform.Tally;
import com.personal.portfolio.user.UserPayloads.CreateUser;
import com.personal.portfolio.user.UserPayloads.UpdateUser;
import com.personal.portfolio.user.UserService.Criteria;
import java.util.List;
import java.util.Optional;
import java.util.stream.Stream;
import org.assertj.core.api.ThrowableAssert.ThrowingCallable;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.params.ParameterizedTest;
import org.junit.jupiter.params.provider.Arguments;
import org.junit.jupiter.params.provider.CsvSource;
import org.junit.jupiter.params.provider.MethodSource;
import org.springframework.security.crypto.password.PasswordEncoder;

class UserServiceTests {

    private static final long ID = 42L;
    private static final long ACTOR = 7L;
    private static final String PASSWORD = "Str0ng-Passw0rd";

    private final UserRepository users = mock(UserRepository.class);
    private final TokenVault vault = mock(TokenVault.class);
    private final PasswordEncoder passwordEncoder = mock(PasswordEncoder.class);
    private final UserService service = new UserService(users, vault, passwordEncoder);

    @Test
    void statsZeroFillEveryStatusAndRole() {
        given(users.tallyByStatus()).willReturn(List.of(
                new Tally<>(AccountStatus.LOCKED, 1L), new Tally<>(AccountStatus.ACTIVE, 3L)));
        given(users.tallyByRole()).willReturn(List.of(new Tally<>(Role.USER, 4L)));

        var stats = service.stats();

        assertThat(stats.total()).isEqualTo(4L);
        assertThat(stats.byStatus()).containsExactly(entry(AccountStatus.PENDING, 0L), entry(AccountStatus.ACTIVE, 3L),
                entry(AccountStatus.LOCKED, 1L), entry(AccountStatus.DISABLED, 0L));
        assertThat(stats.byRole()).containsExactly(entry(Role.USER, 4L), entry(Role.ADMIN, 0L));
    }

    @Test
    void statsOfAnEmptyDirectoryAreAllZero() {
        given(users.tallyByStatus()).willReturn(List.of());
        given(users.tallyByRole()).willReturn(List.of());

        var stats = service.stats();

        assertThat(stats.total()).isZero();
        assertThat(stats.byStatus()).containsOnlyKeys(AccountStatus.values()).allSatisfy((_, count) -> assertThat(count).isZero());
        assertThat(stats.byRole()).containsOnlyKeys(Role.values()).allSatisfy((_, count) -> assertThat(count).isZero());
    }

    @ParameterizedTest(name = "[{index}] q={0}")
    @MethodSource("searchTerms")
    void criteriaBuildALowerCaseContainsPattern(String query, String pattern) {
        assertThat(new Criteria(query, null, null).pattern()).isEqualTo(pattern);
    }

    static Stream<Arguments> searchTerms() {
        return Stream.of(
                Arguments.of("ada", "%ada%"),
                Arguments.of(" Ada ", "%ada%"),
                Arguments.of("LOVELACE", "%lovelace%"),
                Arguments.of("\tGrace Hopper\n", "%grace hopper%"),
                Arguments.of("ada@portfolio.local", "%ada@portfolio.local%"));
    }

    @ParameterizedTest(name = "[{index}] q={0}")
    @CsvSource(delimiter = '|', textBlock = """
            50%      | %50!%%
            a_b      | %a!_b%
            %        | %!%%
            _        | %!_%
            Wow!     | %wow!!%
            C:\\Temp | %c:\\temp%
            """)
    void criteriaEscapeLikeMetacharactersWithTheExclamationMark(String query, String pattern) {
        assertThat(new Criteria(query, null, null).pattern()).isEqualTo(pattern);
    }

    @Test
    void blankOrMissingQueriesDisableTheTextFilter() {
        assertThat(new Criteria(null, Role.ADMIN, AccountStatus.ACTIVE).pattern()).isNull();
        assertThat(new Criteria("", null, null).pattern()).isNull();
        assertThat(new Criteria(" \t\n", null, null).pattern()).isNull();
    }

    @Test
    void createNormalizesTheEmailAndStoresAnActiveAccount() {
        given(users.existsByEmail("grace@example.test")).willReturn(false);
        given(passwordEncoder.encode(PASSWORD)).willReturn("{bcrypt}encoded");
        given(users.save(any(User.class))).willAnswer(invocation -> invocation.getArgument(0));

        var view = service.create(new CreateUser(" Grace Hopper ", " Grace@Example.TEST ", PASSWORD, Role.ADMIN), ACTOR);

        assertThat(view.fullName()).isEqualTo("Grace Hopper");
        assertThat(view.email()).isEqualTo("grace@example.test");
        assertThat(view.role()).isEqualTo(Role.ADMIN);
        assertThat(view.status()).isEqualTo(AccountStatus.ACTIVE);
        verify(users).save(any(User.class));
    }

    @Test
    void createRejectsATakenEmailBeforeHashingThePassword() {
        given(users.existsByEmail("grace@example.test")).willReturn(true);

        assertProblem(() -> service.create(new CreateUser("Grace", "GRACE@example.test", PASSWORD, Role.USER), ACTOR),
                new EmailTaken("grace@example.test"));

        verifyNoInteractions(passwordEncoder);
        verify(users, never()).save(any(User.class));
    }

    @ParameterizedTest(name = "{0} -> {1} revokes refresh tokens: {2}")
    @CsvSource({
        "ACTIVE,   LOCKED,   true",
        "ACTIVE,   DISABLED, true",
        "ACTIVE,   ACTIVE,   false",
        "LOCKED,   ACTIVE,   false",
        "LOCKED,   DISABLED, false",
        "PENDING,  ACTIVE,   false",
        "PENDING,  DISABLED, false",
        "DISABLED, ACTIVE,   false"
    })
    void changeStatusRevokesRefreshTokensOnlyWhenLeavingActive(AccountStatus from, AccountStatus to, boolean revoked) {
        var user = stored(from, Role.USER);

        var view = service.changeStatus(ID, to, ACTOR);

        assertThat(view.status()).isEqualTo(to);
        verify(vault, times(revoked ? 1 : 0)).revoke(user, TokenPurpose.REFRESH);
        verify(users).flush();
        verify(users, never()).findByRoleAndStatus(any(), any());
    }

    @Test
    void administratorsCannotManageThemselves() {
        assertProblem(() -> service.changeStatus(ACTOR, AccountStatus.DISABLED, ACTOR), new SelfManagement());
        assertProblem(() -> service.delete(ACTOR, ACTOR), new SelfManagement());

        verifyNoInteractions(users, vault);
    }

    @Test
    void updateChecksSelfManagementOnlyWhenTheRoleActuallyChanges() {
        var admin = stored(AccountStatus.ACTIVE, Role.ADMIN);

        var renamed = service.update(ID, new UpdateUser("  Root  ", Role.ADMIN), ID);

        assertThat(renamed.fullName()).isEqualTo("Root");
        assertThat(renamed.role()).isEqualTo(Role.ADMIN);

        assertProblem(() -> service.update(ID, new UpdateUser("Demoted", Role.USER), ID), new SelfManagement());
        assertThat(admin.getRole()).isEqualTo(Role.ADMIN);
        assertThat(admin.getFullName()).isEqualTo("Root");
    }

    @Test
    void updateLeavesOmittedFieldsUntouched() {
        var user = stored(AccountStatus.ACTIVE, Role.USER);

        var view = service.update(ID, new UpdateUser(null, null), ACTOR);

        assertThat(view.fullName()).isEqualTo("Grace Hopper");
        assertThat(view.role()).isEqualTo(Role.USER);
        assertThat(user.getFullName()).isEqualTo("Grace Hopper");
    }

    @Test
    void deleteRemovesTheAccountAndLeavesItsTokensToTheCascade() {
        var user = stored(AccountStatus.ACTIVE, Role.USER);

        service.delete(ID, ACTOR);

        verify(users).delete(user);
        verifyNoInteractions(vault);
    }

    @Test
    void refusesToDemoteLockDisableOrDeleteTheLastActiveAdministrator() {
        var admin = stored(AccountStatus.ACTIVE, Role.ADMIN);
        given(users.findByRoleAndStatus(Role.ADMIN, AccountStatus.ACTIVE)).willReturn(List.of(admin));
        var last = new LastAdministrator();

        assertProblem(() -> service.update(ID, new UpdateUser("Renamed", Role.USER), ACTOR), last);
        assertProblem(() -> service.changeStatus(ID, AccountStatus.LOCKED, ACTOR), last);
        assertProblem(() -> service.changeStatus(ID, AccountStatus.DISABLED, ACTOR), last);
        assertProblem(() -> service.delete(ID, ACTOR), last);

        assertThat(admin.getRole()).isEqualTo(Role.ADMIN);
        assertThat(admin.getStatus()).isEqualTo(AccountStatus.ACTIVE);
        assertThat(admin.getFullName()).isEqualTo("Grace Hopper");
        verify(users, never()).delete(any(User.class));
        verifyNoInteractions(vault);
    }

    @Test
    void demotesAnAdministratorWhileAnotherActiveOneRemains() {
        var admin = withAnotherActiveAdministrator();

        assertThat(service.update(ID, new UpdateUser(null, Role.USER), ACTOR).role()).isEqualTo(Role.USER);
        assertThat(admin.getRole()).isEqualTo(Role.USER);
    }

    @Test
    void disablesAnAdministratorWhileAnotherActiveOneRemains() {
        var admin = withAnotherActiveAdministrator();

        assertThat(service.changeStatus(ID, AccountStatus.DISABLED, ACTOR).status()).isEqualTo(AccountStatus.DISABLED);
        verify(vault).revoke(admin, TokenPurpose.REFRESH);
    }

    @Test
    void deletesAnAdministratorWhileAnotherActiveOneRemains() {
        var admin = withAnotherActiveAdministrator();

        service.delete(ID, ACTOR);

        verify(users).delete(admin);
    }

    @Test
    void countsAdministratorsOnlyWhenAnActiveOneWouldLoseAdminRights() {
        stored(AccountStatus.ACTIVE, Role.ADMIN);
        assertThat(service.changeStatus(ID, AccountStatus.ACTIVE, ACTOR).status()).isEqualTo(AccountStatus.ACTIVE);
        assertThat(service.update(ID, new UpdateUser(null, Role.ADMIN), ACTOR).role()).isEqualTo(Role.ADMIN);

        stored(AccountStatus.LOCKED, Role.ADMIN);
        assertThat(service.changeStatus(ID, AccountStatus.DISABLED, ACTOR).status()).isEqualTo(AccountStatus.DISABLED);
        stored(AccountStatus.DISABLED, Role.ADMIN);
        assertThat(service.update(ID, new UpdateUser(null, Role.USER), ACTOR).role()).isEqualTo(Role.USER);
        stored(AccountStatus.PENDING, Role.ADMIN);
        service.delete(ID, ACTOR);

        verify(users, never()).findByRoleAndStatus(any(), any());
    }

    @Test
    void unknownAccountsAreNotFound() {
        given(users.findById(ID)).willReturn(Optional.empty());
        var notFound = new NotFound("user", ID);

        assertProblem(() -> service.get(ID), notFound);
        assertProblem(() -> service.update(ID, new UpdateUser("Name", null), ACTOR), notFound);
        assertProblem(() -> service.changeStatus(ID, AccountStatus.LOCKED, ACTOR), notFound);
        assertProblem(() -> service.delete(ID, ACTOR), notFound);

        verifyNoInteractions(vault);
    }

    private User withAnotherActiveAdministrator() {
        var admin = stored(AccountStatus.ACTIVE, Role.ADMIN);
        var other = User.register("Ada Lovelace", "ada@example.test", "{bcrypt}hash", Role.ADMIN, AccountStatus.ACTIVE);
        given(users.findByRoleAndStatus(Role.ADMIN, AccountStatus.ACTIVE)).willReturn(List.of(admin, other));
        return admin;
    }

    private User stored(AccountStatus status, Role role) {
        var user = User.register("Grace Hopper", "grace@example.test", "{bcrypt}hash", role, status);
        given(users.findById(ID)).willReturn(Optional.of(user));
        return user;
    }

    private static void assertProblem(ThrowingCallable call, Problem problem) {
        assertThatThrownBy(call).isInstanceOfSatisfying(ApiException.class,
                failure -> assertThat(failure.problem()).isEqualTo(problem));
    }
}
