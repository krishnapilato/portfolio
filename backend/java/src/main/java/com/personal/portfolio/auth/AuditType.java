package com.personal.portfolio.auth;

import com.personal.portfolio.platform.CorrelationFilter;
import java.time.Instant;
import java.util.HashMap;
import java.util.Map;
import org.springframework.boot.actuate.audit.listener.AuditApplicationEvent;

enum AuditType {
    USER_REGISTERED,
    EMAIL_VERIFIED,
    AUTHENTICATION_SUCCESS,
    AUTHENTICATION_FAILURE,
    ACCOUNT_LOCKED,
    TOKEN_REUSE,
    PASSWORD_RESET,
    PASSWORD_CHANGED;

    AuditApplicationEvent event(Instant timestamp, String principal, Map<String, ?> details) {
        var data = new HashMap<String, Object>(details);
        CorrelationFilter.current().ifPresent(requestId -> data.put("requestId", requestId));
        return new AuditApplicationEvent(timestamp, principal, name(), data);
    }
}
