package com.personal.portfolio.mail;

import module java.base;

public sealed interface Notification {

    String recipient();

    String name();

    record VerifyEmail(String recipient, String name, String token, URI link) implements Notification {}

    record ResetPassword(String recipient, String name, String token, URI link, Duration validity) implements Notification {}

    record PasswordChanged(String recipient, String name, Instant changedAt) implements Notification {}
}
