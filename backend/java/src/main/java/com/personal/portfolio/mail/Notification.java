package com.personal.portfolio.mail;

import java.net.URI;
import java.time.Duration;
import java.time.Instant;

public sealed interface Notification {

    String recipient();

    String name();

    record VerifyEmail(String recipient, String name, String token, URI link) implements Notification {}

    record ResetPassword(String recipient, String name, String token, URI link, Duration validity)
            implements Notification {}

    record PasswordChanged(String recipient, String name, Instant changedAt) implements Notification {}
}
