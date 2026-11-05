package com.example.application.auth;

import module java.base;

import com.example.application.platform.CorrelationFilter;
import org.springframework.boot.actuate.audit.listener.AuditApplicationEvent;

enum AuditType {
    USER_REGISTERED, EMAIL_VERIFIED, AUTHENTICATION_SUCCESS, AUTHENTICATION_FAILURE,
    ACCOUNT_LOCKED, TOKEN_REUSE, PASSWORD_RESET, PASSWORD_CHANGED;

    AuditApplicationEvent event(Instant timestamp, String principal, Map<String, ?> details) {
        var data = new HashMap<String, Object>(details);
        CorrelationFilter.current().ifPresent(id -> data.put("requestId", id));
        return new AuditApplicationEvent(timestamp, principal, name(), data);
    }
}
