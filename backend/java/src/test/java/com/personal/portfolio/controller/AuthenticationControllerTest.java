package com.personal.portfolio.controller;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.personal.portfolio.dto.login.LoginUserRequest;
import com.personal.portfolio.dto.registration.RegisterUserRequest;
import com.personal.portfolio.model.Role;
import com.personal.portfolio.model.User;
import com.personal.portfolio.service.AuthenticationService;
import com.personal.portfolio.service.JwtService;
import com.personal.portfolio.service.UserService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.http.MediaType;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.authentication.DisabledException;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.setup.MockMvcBuilders;

import java.util.Date;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.BDDMockito.given;
import static org.mockito.Mockito.doThrow;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@ExtendWith(MockitoExtension.class)
class AuthenticationControllerTest {

    private MockMvc mockMvc;

    @Mock
    private AuthenticationService authenticationService;

    @Mock
    private JwtService jwtService;

    @Mock
    private UserService userService;

    @InjectMocks
    private AuthenticationController authenticationController;

    private ObjectMapper objectMapper;

    @BeforeEach
    void setUp() {
        mockMvc = MockMvcBuilders.standaloneSetup(authenticationController).build();
        objectMapper = new ObjectMapper();
    }

    @Test
    void shouldLoginSuccessfully() throws Exception {
        LoginUserRequest request = new LoginUserRequest("user@example.com", "password");

        when(userService.loadUserByUsername("user@example.com"))
                .thenReturn(User.builder().locked(false).build());

        when(jwtService.generateToken(any()))
                .thenReturn("mocked-jwt-token");
        when(jwtService.extractExpiration(any()))
                .thenReturn(new Date(System.currentTimeMillis() + 3600000));

        mockMvc.perform(post("/auth/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.token").value("mocked-jwt-token"));
    }

    @Test
    void shouldReturnUnauthorizedOnBadCredentials() throws Exception {
        LoginUserRequest request = new LoginUserRequest("user@example.com", "wrongpassword");

        given(userService.loadUserByUsername("user@example.com"))
                .willReturn(User.builder().locked(false).build());
        doThrow(new BadCredentialsException("Invalid"))
                .when(authenticationService).authenticate(any());

        mockMvc.perform(post("/auth/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isUnauthorized())
                .andExpect(jsonPath("$.errorCode").value("INVALID_CREDENTIALS"));
    }

    @Test
    void shouldReturnForbiddenOnDisabledAccount() throws Exception {
        LoginUserRequest request = new LoginUserRequest("user@example.com", "password");

        given(userService.loadUserByUsername("user@example.com"))
                .willReturn(User.builder().locked(false).build());
        doThrow(new DisabledException("Disabled"))
                .when(authenticationService).authenticate(any());

        mockMvc.perform(post("/auth/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isForbidden())
                .andExpect(jsonPath("$.errorCode").value("ACCOUNT_DISABLED"));
    }

    @Test
    void shouldReturnForbiddenOnLockedAccount() throws Exception {
        LoginUserRequest request = new LoginUserRequest("user@example.com", "password");

        given(userService.loadUserByUsername("user@example.com"))
                .willReturn(User.builder().locked(true).build());

        mockMvc.perform(post("/auth/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isForbidden())
                .andExpect(jsonPath("$.errorCode").value("ACCOUNT_LOCKED"));
    }

    @Test
    void shouldRegisterUserSuccessfully() throws Exception {
        RegisterUserRequest request = new RegisterUserRequest("New User", "new@example.com", "password");

        User savedUser = User.builder().id(1L).email("new@example.com").build();
        given(authenticationService.signup(any()))
                .willReturn(savedUser);

        mockMvc.perform(post("/auth/signup")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.userId").value(1L))
                .andExpect(jsonPath("$.role").value(Role.USER.name()));
    }

    @Test
    void shouldReturnConflictWhenEmailAlreadyTaken() throws Exception {
        RegisterUserRequest request = new RegisterUserRequest("New User", "new@example.com", "password");

        given(authenticationService.signup(any()))
                .willThrow(new DataIntegrityViolationException("Email taken"));

        mockMvc.perform(post("/auth/signup")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isConflict())
                .andExpect(jsonPath("$.status").value("error"))
                .andExpect(jsonPath("$.message").value("EMAIL_ALREADY_TAKEN"));
    }

    @Test
    void shouldReturnBadRequestOnUnexpectedException() throws Exception {
        RegisterUserRequest request = new RegisterUserRequest("New User", "unexpected@example.com", "password");

        given(authenticationService.signup(any()))
                .willThrow(new RuntimeException("Server error"));

        mockMvc.perform(post("/auth/signup")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.status").value("error"))
                .andExpect(jsonPath("$.message").value("INVALID_INPUT"));
    }
}