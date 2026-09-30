package com.personal.portfolio.auth;

import com.personal.portfolio.auth.AuthPayloads.PasswordChange;
import com.personal.portfolio.auth.AuthPayloads.ProfileUpdate;
import com.personal.portfolio.security.AccessTokens;
import com.personal.portfolio.user.UserPayloads.UserView;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequiredArgsConstructor
@Tag(name = "Account", description = "Self-service profile, password and session management")
@RequestMapping(path = "/api/v{version}/me", version = "1")
class AccountController {

    private final AuthService auth;

    @GetMapping
    UserView profile(@AuthenticationPrincipal Jwt jwt) {
        return auth.profile(AccessTokens.userId(jwt));
    }

    @PatchMapping
    UserView updateProfile(@AuthenticationPrincipal Jwt jwt, @Valid @RequestBody ProfileUpdate update) {
        return auth.updateProfile(AccessTokens.userId(jwt), update);
    }

    @PutMapping("/password")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    void changePassword(@AuthenticationPrincipal Jwt jwt, @Valid @RequestBody PasswordChange change) {
        auth.changePassword(AccessTokens.userId(jwt), change);
    }

    @DeleteMapping("/sessions")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    void endSessions(@AuthenticationPrincipal Jwt jwt) {
        auth.endSessions(AccessTokens.userId(jwt));
    }
}
