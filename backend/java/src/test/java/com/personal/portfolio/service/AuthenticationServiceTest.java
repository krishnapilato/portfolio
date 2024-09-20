package com.personal.portfolio.service;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import java.util.Optional;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.MockitoAnnotations;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.crypto.password.PasswordEncoder;

import com.personal.portfolio.dto.login.LoginUserRequest;
import com.personal.portfolio.dto.registration.RegisterUserRequest;
import com.personal.portfolio.model.User;
import com.personal.portfolio.repository.UserRepository;

class AuthenticationServiceTest {
	@Mock
	private UserRepository userRepository;

	@Mock
	private PasswordEncoder passwordEncoder;

	@Mock
	private AuthenticationManager authenticationManager;

	@InjectMocks
	private AuthenticationService authenticationService;

	@BeforeEach
	void setUp() {
		MockitoAnnotations.openMocks(this);
	}

	@Test
	void testSignup() {
		RegisterUserRequest registerUserDto = new RegisterUserRequest();
		registerUserDto.setFullName("Name Surname");
		registerUserDto.setEmail("name.surname@email.com");
		registerUserDto.setPassword("password");

		User user = new User();
		user.setId(1L);
		user.setFullName("Name Surname");
		user.setEmail("name.surname@email.com");
		user.setPassword("encodedPassword");

		when(passwordEncoder.encode("password")).thenReturn("encodedPassword");
		when(userRepository.save(any(User.class))).thenReturn(user);

		User registeredUser = authenticationService.signup(registerUserDto);

		assertNotNull(registeredUser);
		assertEquals(1L, registeredUser.getId());
		assertEquals("name.surname@email.com", registeredUser.getEmail());

		verify(passwordEncoder).encode("password");
		verify(userRepository).save(any(User.class));
	}

	@Test
	void testSignupDuplicateEmail() {
		RegisterUserRequest registerUserDto = new RegisterUserRequest();
	    registerUserDto.setFullName("Name Surname");
	    registerUserDto.setEmail("name.surname@email.com");
	    registerUserDto.setPassword("password");

	    when(userRepository.findByEmail("name.surname@email.com")).thenReturn(Optional.of(new User()));

	    assertThrows(DataIntegrityViolationException.class, () -> authenticationService.signup(registerUserDto));

	    verify(userRepository, never()).save(any(User.class));
	}
	
	@Test
	void testAuthenticateSuccess() {
		LoginUserRequest loginUserDto = new LoginUserRequest("name.surname@email.com", "password");

		User user = new User();
		user.setId(1L);
		user.setFullName("Name Surname");
		user.setEmail("name.surname@email.com");
		user.setPassword("encodedPassword");

		when(userRepository.findByEmail("name.surname@email.com")).thenReturn(Optional.of(user));
		when(authenticationManager.authenticate(any(UsernamePasswordAuthenticationToken.class)))
				.thenReturn(new UsernamePasswordAuthenticationToken(user, "encodedPassword", user.getAuthorities()));

		User authenticatedUser = authenticationService.authenticate(loginUserDto);

		assertNotNull(authenticatedUser);
		assertEquals("name.surname@email.com", authenticatedUser.getEmail());

		verify(authenticationManager).authenticate(any(UsernamePasswordAuthenticationToken.class));
		verify(userRepository).findByEmail("name.surname@email.com");
	}
	
	@Test
	void testAuthenticateIncorrectPassword() {
		LoginUserRequest loginUserDto = new LoginUserRequest("name.surname@email.com", "wrongPassword");

	    User user = new User();
	    user.setId(1L);
	    user.setFullName("Name Surname");
	    user.setEmail("name.surname@email.com");
	    user.setPassword("encodedPassword");

	    when(userRepository.findByEmail("name.surname@email.com")).thenReturn(Optional.of(user));
	    when(authenticationManager.authenticate(any(UsernamePasswordAuthenticationToken.class)))
	            .thenThrow(new BadCredentialsException("Invalid credentials"));
	    
	    assertThrows(BadCredentialsException.class, () -> authenticationService.authenticate(loginUserDto));

	    verify(authenticationManager).authenticate(any(UsernamePasswordAuthenticationToken.class));
	    verify(userRepository).findByEmail("name.surname@email.com");
	}
}