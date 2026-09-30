package com.personal.portfolio.auth;

import com.personal.portfolio.auth.AuthPayloads.Credentials;
import com.personal.portfolio.auth.AuthPayloads.EmailRequest;
import com.personal.portfolio.auth.AuthPayloads.PasswordReset;
import com.personal.portfolio.auth.AuthPayloads.RefreshRequest;
import com.personal.portfolio.auth.AuthPayloads.Registration;
import com.personal.portfolio.auth.AuthPayloads.TokenPair;
import com.personal.portfolio.auth.AuthPayloads.TokenRequest;
import com.personal.portfolio.user.UserPayloads.UserView;
import io.swagger.v3.oas.annotations.security.SecurityRequirements;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.servlet.support.ServletUriComponentsBuilder;

@RestController
@RequiredArgsConstructor
@SecurityRequirements
@Tag(name = "Authentication", description = "Registration, email verification, token issuance and password recovery")
@RequestMapping(path = "/api/v{version}/auth", version = "1")
class AuthController {

    private static final String ACCOUNT_PATH = "/api/v1/me";

    private final AuthService auth;

    @PostMapping("/register")
    ResponseEntity<UserView> register(@Valid @RequestBody Registration registration) {
        var user = auth.register(registration);
        var account = ServletUriComponentsBuilder.fromCurrentContextPath().path(ACCOUNT_PATH).build().toUri();
        return ResponseEntity.created(account).body(user);
    }

    @PostMapping("/verify")
    UserView verify(@Valid @RequestBody TokenRequest request) {
        return auth.verify(request);
    }

    @PostMapping("/verify/resend")
    @ResponseStatus(HttpStatus.ACCEPTED)
    void resendVerification(@Valid @RequestBody EmailRequest request) {
        auth.resendVerification(request);
    }

    @PostMapping("/login")
    TokenPair login(@Valid @RequestBody Credentials credentials) {
        return auth.login(credentials);
    }

    @PostMapping("/refresh")
    TokenPair refresh(@Valid @RequestBody RefreshRequest request) {
        return auth.refresh(request);
    }

    @PostMapping("/logout")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    void logout(@Valid @RequestBody RefreshRequest request) {
        auth.logout(request);
    }

    @PostMapping("/password/forgot")
    @ResponseStatus(HttpStatus.ACCEPTED)
    void forgotPassword(@Valid @RequestBody EmailRequest request) {
        auth.forgotPassword(request);
    }

    @PostMapping("/password/reset")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    void resetPassword(@Valid @RequestBody PasswordReset reset) {
        auth.resetPassword(reset);
    }
}
