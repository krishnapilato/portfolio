package com.personal.portfolio.controller;

import java.net.URI;
import java.util.List;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.web.bind.annotation.*;

import com.personal.portfolio.model.User;
import com.personal.portfolio.service.UserService;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;

@RequestMapping("/api/users")
@RestController
@RequiredArgsConstructor
@Tag(name = "Users", description = "Endpoints for managing user data.")
public class UserController {

	private static final Logger logger = LoggerFactory.getLogger(UserController.class);

	private final UserService userService;

	@GetMapping
	@Operation(summary = "Get all users", description = "Retrieve a list of all registered users.")
	public ResponseEntity<List<User>> getAllUsers() {
		List<User> users = userService.getAllUsers();
		return ResponseEntity.ok(users);
	}

	@GetMapping("/{id}")
	@Operation(summary = "Get user by ID", description = "Retrieve a user by ID.")
	public ResponseEntity<User> getUserById(@PathVariable Long id) {
		return userService.getUserById(id)
				.map(ResponseEntity::ok)
				.orElse(ResponseEntity.notFound().build());
	}

	@PostMapping
	@Operation(summary = "Create a new user", description = "Registers a new user in the system.")
	public ResponseEntity<User> createUser(@Valid @RequestBody User newUser) {
		User createdUser = userService.createUser(newUser);
		URI location = URI.create("/api/users/" + createdUser.getId());
		logger.info("User created with ID: {}", createdUser.getId());
		return ResponseEntity.created(location).body(createdUser);
	}

	@PutMapping("/{id}")
	@Operation(summary = "Update user by ID", description = "Update a user's details by ID.")
	public ResponseEntity<User> updateUser(@PathVariable Long id, @Valid @RequestBody User updatedUser) {
		try {
			User user = userService.updateUser(id, updatedUser);
			logger.info("User updated with ID: {}", user.getId());
			return ResponseEntity.ok(user);
		} catch (UsernameNotFoundException e) {
			logger.warn("Update failed for user ID: {} - {}", id, e.getMessage());
			return ResponseEntity.notFound().build();
		}
	}

	@PutMapping("/{id}/lock")
	@Operation(summary = "Toggle user lock status", description = "Locks or unlocks a user account.")
	public ResponseEntity<User> toggleLockUser(@PathVariable Long id) {
		try {
			User user = userService.toggleLock(id);
			logger.info("User lock status toggled for ID: {}", user.getId());
			return ResponseEntity.ok(user);
		} catch (UsernameNotFoundException e) {
			logger.warn("Toggle lock failed for user ID: {} - {}", id, e.getMessage());
			return ResponseEntity.status(HttpStatus.NOT_FOUND).build();
		}
	}

	@DeleteMapping("/{id}")
	@Operation(summary = "Delete user by ID", description = "Delete a user by ID.")
	public ResponseEntity<Void> deleteUser(@PathVariable Long id) {
		try {
			userService.deleteUser(id);
			logger.info("User deleted with ID: {}", id);
			return ResponseEntity.noContent().build();
		} catch (UsernameNotFoundException e) {
			logger.warn("Delete failed for user ID: {} - {}", id, e.getMessage());
			return ResponseEntity.notFound().build();
		}
	}
}