package com.personal.portfolio.controller;

import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.AuthenticationException;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.personal.portfolio.dto.LoginResponse;
import com.personal.portfolio.dto.LoginUserDto;
import com.personal.portfolio.dto.RegisterUserDto;
import com.personal.portfolio.dto.RegistrationResponse;
import com.personal.portfolio.model.User;
import com.personal.portfolio.service.AuthenticationService;
import com.personal.portfolio.service.JwtService;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;

@RequestMapping("/auth")
@RestController
@Tag(name = "Authentication", description = "Endpoints for user authentication and registration")
public class AuthenticationController {
	private final JwtService jwtService;

	private final AuthenticationService authenticationService;

	public AuthenticationController(JwtService jwtService, AuthenticationService authenticationService) {
		this.jwtService = jwtService;
		this.authenticationService = authenticationService;
	}

	@PostMapping("/login")
	@Operation(summary = "User Login", description = "Authenticate a user and generate a JWT token.")
	public ResponseEntity<LoginResponse> authenticate(@RequestBody LoginUserDto loginUserDto) {
		try {
			User authenticatedUser = authenticationService.authenticate(loginUserDto);
			String jwtToken = jwtService.generateToken(authenticatedUser);

			LoginResponse loginResponse = new LoginResponse(jwtToken, jwtService.getExpirationTime());
			return ResponseEntity.ok(loginResponse);
		} catch (AuthenticationException e) {
			String errorMessage = "Authentication failed: " + e.getMessage();
			return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(new LoginResponse(errorMessage, 0));
		}
	}

	@PostMapping("/signup")
	@Operation(summary = "User Registration", description = "Register a new user.")
	public ResponseEntity<RegistrationResponse> register(@RequestBody RegisterUserDto registerUserDto) {
		try {
			User registeredUser = authenticationService.signup(registerUserDto);
			if (registeredUser == null) {
				return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
						.body(new RegistrationResponse("User creation failed.", null));
			} else {
				return ResponseEntity.status(HttpStatus.CREATED).body(new RegistrationResponse(
						"User created successfully with ID: " + registeredUser.getId(), registeredUser.getId()));
			}
		} catch (DataIntegrityViolationException ex) {
			return ResponseEntity.status(HttpStatus.CONFLICT)
					.body(new RegistrationResponse("User creation failed due to duplicate data.", null));
		} catch (Exception ex) {
			return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
					.body(new RegistrationResponse("An error occurred during user registration.", null));
		}
	}
}