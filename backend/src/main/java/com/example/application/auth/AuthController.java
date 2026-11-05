package com.example.application.auth;

import com.example.application.auth.AuthPayloads.Credentials;
import com.example.application.auth.AuthPayloads.EmailRequest;
import com.example.application.auth.AuthPayloads.PasswordReset;
import com.example.application.auth.AuthPayloads.RefreshRequest;
import com.example.application.auth.AuthPayloads.Registration;
import com.example.application.auth.AuthPayloads.TokenPair;
import com.example.application.auth.AuthPayloads.TokenRequest;
import com.example.application.user.UserPayloads.UserView;
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
@SecurityRequirements
@Tag(name = "Authentication", description = "Registration, email verification, token issuance and password recovery")
@RequestMapping(path = "/api/v{version}/auth", version = "1")
@RequiredArgsConstructor
class AuthController {

    private final AuthService auth;

    @PostMapping("/register")
    ResponseEntity<UserView> register(@Valid @RequestBody Registration registration) {
        var user = auth.register(registration);
        var account = ServletUriComponentsBuilder.fromCurrentContextPath().path("/api/v1/me").build().toUri();
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
