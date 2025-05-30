package com.personal.portfolio.service;

import com.personal.portfolio.dto.login.LoginUserRequest;
import com.personal.portfolio.dto.registration.RegisterUserRequest;
import com.personal.portfolio.model.Role;
import com.personal.portfolio.model.User;
import com.personal.portfolio.repository.UserRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.dao.DuplicateKeyException;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.AuthenticationException;
import org.springframework.security.crypto.password.PasswordEncoder;

import static org.assertj.core.api.Assertions.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class AuthenticationServiceTest {

    @InjectMocks
    private AuthenticationService authenticationService;

    @Mock
    private UserRepository userRepository;

    @Mock
    private PasswordEncoder passwordEncoder;

    @Mock
    private AuthenticationManager authenticationManager;

    private LoginUserRequest loginRequest;
    private RegisterUserRequest registerRequest;

    @BeforeEach
    void setUp() {
        loginRequest = new LoginUserRequest("test@example.com", "password123");
        registerRequest = new RegisterUserRequest("Test User", "test@example.com", "password123");
    }

    @Test
    void authenticate_success() {
        // Arrange: authenticationManager.authenticate does not throw
        when(authenticationManager.authenticate(any(UsernamePasswordAuthenticationToken.class)))
                .thenReturn(mock(org.springframework.security.core.Authentication.class));

        // Act + Assert: no exception thrown
        assertThatCode(() -> authenticationService.authenticate(loginRequest))
                .doesNotThrowAnyException();

        verify(authenticationManager, times(1))
                .authenticate(any(UsernamePasswordAuthenticationToken.class));
    }

    @Test
    void authenticate_failure_throwsBadCredentialsException() {
        // Arrange: authenticationManager.authenticate throws AuthenticationException
        when(authenticationManager.authenticate(any(UsernamePasswordAuthenticationToken.class)))
                .thenThrow(new AuthenticationException("Bad creds") {
                });

        // Act + Assert: should throw BadCredentialsException
        assertThatThrownBy(() -> authenticationService.authenticate(loginRequest))
                .isInstanceOf(BadCredentialsException.class)
                .hasMessageContaining("Invalid credentials");

        verify(authenticationManager, times(1))
                .authenticate(any(UsernamePasswordAuthenticationToken.class));
    }

    @Test
    void signup_success() {
        // Arrange: email does not exist, password is encoded, and user is saved
        when(userRepository.existsByEmail(registerRequest.email())).thenReturn(false);
        when(passwordEncoder.encode(registerRequest.password())).thenReturn("hashedPassword");
        when(userRepository.save(any(User.class))).thenAnswer(invocation -> {
            User u = invocation.getArgument(0);
            u.setId(1L);
            return u;
        });

        // Act
        User savedUser = authenticationService.signup(registerRequest);

        // Assert
        assertThat(savedUser).isNotNull();
        assertThat(savedUser.getId()).isEqualTo(1L);
        assertThat(savedUser.getEmail()).isEqualTo(registerRequest.email());
        assertThat(savedUser.getRole()).isEqualTo(Role.USER);

        verify(userRepository, times(1)).save(any(User.class));
    }

    @Test
    void signup_failure_existingEmail_throwsDuplicateKeyException() {
        // Arrange: email exists
        when(userRepository.existsByEmail(registerRequest.email())).thenReturn(true);

        // Act + Assert
        assertThatThrownBy(() -> authenticationService.signup(registerRequest))
                .isInstanceOf(DuplicateKeyException.class)
                .hasMessageContaining("already exists");

        verify(userRepository, never()).save(any(User.class));
    }
}