package com.personal.portfolio.controller;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.AuthenticationException;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.context.request.WebRequest;

import com.personal.portfolio.dto.login.LoginResponse;
import com.personal.portfolio.dto.login.LoginUserDto;
import com.personal.portfolio.dto.registration.RegisterUserDto;
import com.personal.portfolio.dto.registration.RegistrationResponse;
import com.personal.portfolio.model.Role;
import com.personal.portfolio.model.User;
import com.personal.portfolio.service.AuthenticationService;
import com.personal.portfolio.service.JwtService;
import com.personal.portfolio.service.UserService;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;

@RequestMapping("/auth")
@RestController
@Tag(name = "Authentication", description = "Endpoints for user authentication and registration.")
public class AuthenticationController {

	private static final Logger logger = LoggerFactory.getLogger(AuthenticationController.class);
	private final JwtService jwtService;
	private final AuthenticationService authenticationService;
	private final UserService userService;

	public AuthenticationController(JwtService jwtService, AuthenticationService authenticationService,
			UserService userService) {
		this.jwtService = jwtService;
		this.authenticationService = authenticationService;
		this.userService = userService;
	}

	@PostMapping("/login")
	@Operation(summary = "User Login", description = "Authenticate a user and generate a JWT token.")
	public ResponseEntity<LoginResponse> authenticate(@Valid @RequestBody LoginUserDto loginUserDto) {
	    try {
	        User user = (User) userService.loadUserByUsername(loginUserDto.getEmail());

	        if (user.isLocked()) {
	            logger.warn("Authentication failed for email: {}. User is locked.", loginUserDto.getEmail());
	            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
	                    .body(new LoginResponse("ACCOUNT_LOCKED", "This account is locked. Please contact support."));
	        }

	        User authenticatedUser = authenticationService.authenticate(loginUserDto);
	        String jwtToken = jwtService.generateToken(authenticatedUser);
	        long expirationMillis = jwtService.extractExpiration(jwtToken).toInstant().toEpochMilli();

	        return ResponseEntity.ok(new LoginResponse(jwtToken, expirationMillis, authenticatedUser.getRole())); 
	    } catch (AuthenticationException e) {
	        logger.warn("Authentication failed for email: {}", loginUserDto.getEmail(), e);
	        return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
	                .body(new LoginResponse("INVALID_CREDENTIALS", "Invalid credentials provided."));
	    } catch (Exception e) {
	        logger.error("Unexpected error during authentication", e);
	        return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
	                .body(new LoginResponse("SERVER_ERROR", "An unexpected error occurred."));
	    }
	}

	@PostMapping("/signup")
	@Operation(summary = "User Registration", description = "Register a new user.")
	public ResponseEntity<RegistrationResponse> signup(@Valid @RequestBody RegisterUserDto registerUserDto) {
		try {
			User registeredUser = authenticationService.signup(registerUserDto);
			return ResponseEntity.status(HttpStatus.CREATED)
					.body(new RegistrationResponse(registeredUser.getId(), Role.USER));
		} catch (DataIntegrityViolationException ex) {
			logger.warn("Registration failed due to duplicate email: {}", registerUserDto.getEmail(), ex);
			return ResponseEntity.status(HttpStatus.CONFLICT)
					.body(new RegistrationResponse("DUPLICATE_EMAIL", "Email address already in use."));
		} catch (Exception ex) {
			logger.error("An error occurred during user registration", ex);
			return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
					.body(new RegistrationResponse("SERVER_ERROR", "An error occurred during registration."));
		}
	}

	@ExceptionHandler(MethodArgumentNotValidException.class)
	public ResponseEntity<RegistrationResponse> handleValidationExceptions(MethodArgumentNotValidException ex,
			WebRequest request) {
		logger.error("Validation error occurred: {}", ex.getMessage());
		String errorMessage = "Validation failed: " + ex.getBindingResult().getAllErrors().get(0).getDefaultMessage();
		return ResponseEntity.status(HttpStatus.BAD_REQUEST)
				.body(new RegistrationResponse("VALIDATION_ERROR", errorMessage));
	}
}