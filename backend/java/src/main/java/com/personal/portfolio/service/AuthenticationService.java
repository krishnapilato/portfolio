package com.personal.portfolio.service;

import com.personal.portfolio.dto.login.LoginUserRequest;
import com.personal.portfolio.dto.registration.RegisterUserRequest;
import com.personal.portfolio.model.Role;
import com.personal.portfolio.model.User;
import com.personal.portfolio.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;

@Slf4j
@Service
@RequiredArgsConstructor
public class AuthenticationService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final AuthenticationManager authenticationManager;

    public void authenticate(LoginUserRequest input) {
        log.info("Attempting authentication for email: {}", input.email());

        authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(input.email(), input.password())
        );

        log.info("Authentication passed manager checks for email: {}", input.email());
    }

    @Transactional
    public User signup(RegisterUserRequest input) {
        if (userRepository.existsByEmail(input.email())) {
            log.warn("Signup attempt failed: email {} already exists.", input.email());
            throw new DataIntegrityViolationException("User with email " + input.email() + " already exists.");
        }

        var user = User.builder()
                .fullName(input.fullName())
                .email(input.email())
                .password(passwordEncoder.encode(input.password()))
                .role(Role.USER)
                .lastLogin(Instant.now())
                .build();

        var savedUser = userRepository.save(user);
        log.info("New user registered with email: {}", savedUser.getEmail());

        return savedUser;
    }
}