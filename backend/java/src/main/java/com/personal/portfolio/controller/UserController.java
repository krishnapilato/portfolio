package com.personal.portfolio.controller;

import java.net.URI;
import java.util.List;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.personal.portfolio.model.User;
import com.personal.portfolio.service.UserService;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.media.Content;
import io.swagger.v3.oas.annotations.media.Schema;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;

@RequestMapping("/api/users")
@RestController
@RequiredArgsConstructor
@Tag(name = "Users", description = "Endpoints for managing user data.")
public class UserController {

	private UserService userService;

	@GetMapping
	@Operation(summary = "Get all users", description = "Retrieve a list of all registered users.")
	@ApiResponse(responseCode = "200", description = "List of users", content = @Content(schema = @Schema(implementation = User.class)))
	public ResponseEntity<List<User>> getAllUsers() {
		List<User> users = userService.getAllUsers().toList();
		return ResponseEntity.ok(users);
	}

	@GetMapping("/{id}")
	@Operation(summary = "Get user by ID", description = "Retrieve a user by their unique identifier.")
	@ApiResponses(value = {
			@ApiResponse(responseCode = "200", description = "User found", content = @Content(schema = @Schema(implementation = User.class))),
			@ApiResponse(responseCode = "404", description = "User not found", content = @Content()) })
	public ResponseEntity<User> getUserById(@PathVariable Long id) {
		return userService.getUserById(id).map(ResponseEntity::ok).orElse(ResponseEntity.notFound().build());
	}

	@PostMapping
	@Operation(summary = "Create a new user", description = "Registers a new user in the system.")
	@ApiResponses(value = {
			@ApiResponse(responseCode = "201", description = "User created successfully", content = @Content(schema = @Schema(implementation = User.class))),
			@ApiResponse(responseCode = "400", description = "Invalid user data", content = @Content()) })
	public ResponseEntity<User> createUser(@Valid @RequestBody User newUser) {
		User createdUser = userService.createUser(newUser);
		return ResponseEntity.created(URI.create("/api/users/" + createdUser.getId())).body(createdUser);
	}

	@PutMapping("/{id}")
	@Operation(summary = "Update user by ID", description = "Update a user's details by their unique identifier.")
	@ApiResponses(value = {
			@ApiResponse(responseCode = "200", description = "User updated", content = @Content(schema = @Schema(implementation = User.class))),
			@ApiResponse(responseCode = "404", description = "User not found", content = @Content()) })
	public ResponseEntity<User> updateUser(@PathVariable Long id, @Valid @RequestBody User updatedUser) {
		try {
			return ResponseEntity.ok(userService.updateUser(id, updatedUser));
		} catch (UsernameNotFoundException e) {
			return ResponseEntity.notFound().build();
		}
	}

	@PutMapping("/{id}/lock")
	@Operation(summary = "Toggle user lock status", description = "Locks or unlocks a user account.")
	@ApiResponses(value = {
			@ApiResponse(responseCode = "200", description = "User lock status toggled successfully", content = @Content(schema = @Schema(implementation = User.class))),
			@ApiResponse(responseCode = "404", description = "User not found", content = @Content()) })
	public ResponseEntity<User> toggleLockUser(@PathVariable Long id) {
		try {
			User user = userService.toggleLock(id);
			return ResponseEntity.ok(user);
		} catch (UsernameNotFoundException e) {
			return ResponseEntity.status(HttpStatus.NOT_FOUND).build();
		}
	}

	@DeleteMapping("/{id}")
	@Operation(summary = "Delete user by ID", description = "Delete a user by their unique identifier.")
	@ApiResponses(value = { @ApiResponse(responseCode = "204", description = "User deleted"),
			@ApiResponse(responseCode = "404", description = "User not found", content = @Content()) })
	public ResponseEntity<Void> deleteUser(@PathVariable Long id) {
		try {
			userService.deleteUser(id);
			return ResponseEntity.noContent().build();
		} catch (UsernameNotFoundException e) {
			return ResponseEntity.notFound().build();
		}
	}
}