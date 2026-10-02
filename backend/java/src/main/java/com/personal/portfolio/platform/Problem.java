package com.personal.portfolio.platform;

import com.personal.portfolio.auth.TokenPurpose;
import com.personal.portfolio.mail.MailStatus;
import com.personal.portfolio.user.AccountStatus;
import java.time.Instant;
import java.util.Set;

/// Every business error the API can return. The interface is sealed, so the switch in ProblemHandler
/// is exhaustive: a new problem without a decided HTTP response does not compile.
public sealed interface Problem {

    record NotFound(String resource, Object key) implements Problem {}

    record EmailTaken(String email) implements Problem {}

    record InvalidCredentials() implements Problem {}

    record AccountUnavailable(AccountStatus status) implements Problem {}

    record TemporarilyLocked(Instant until) implements Problem {}

    record RateLimited(Instant until) implements Problem {}

    record InvalidToken(TokenPurpose purpose) implements Problem {}

    record TokenReuse() implements Problem {}

    record IllegalTransition(AccountStatus from, AccountStatus to) implements Problem {}

    record SelfManagement() implements Problem {}

    record LastAdministrator() implements Problem {}

    record WrongPassword() implements Problem {}

    record UnsupportedSort(String property, Set<String> allowed) implements Problem {}

    record MailNotModifiable(long id, MailStatus status) implements Problem {}
}
