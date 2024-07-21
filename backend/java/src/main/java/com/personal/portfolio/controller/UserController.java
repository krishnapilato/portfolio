package com.personal.portfolio.controller;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
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

@RequestMapping("/api/users")
@RestController
@Tag(name = "Users", description = "Endpoints for managing user data.")
public class UserController {

	@Autowired
	private UserService userService;

	@GetMapping("/{id}")
	@Operation(summary = "Get user by ID", description = "Retrieve a user by their unique identifier.")
	@ApiResponses(value = {
			@ApiResponse(responseCode = "200", description = "User found", content = @Content(schema = @Schema(implementation = User.class))),
			@ApiResponse(responseCode = "404", description = "User not found", content = @Content()) })
	public ResponseEntity<User> getUserById(@PathVariable Long id) {
		return userService.getUserById(id).map(user -> new ResponseEntity<>(user, HttpStatus.OK))
				.orElseGet(() -> new ResponseEntity<>(HttpStatus.NOT_FOUND));
	}

	@GetMapping
	@Operation(summary = "Get all users", description = "Retrieve a list of all registered users.")
	@ApiResponse(responseCode = "200", description = "List of users", content = @Content(schema = @Schema(implementation = User.class)))
	public ResponseEntity<List<User>> getAllUsers() {
		List<User> users = userService.getAllUsers();
		return new ResponseEntity<>(users, HttpStatus.OK);
	}

	@PutMapping("/{id}")
	@Operation(summary = "Update user by ID", description = "Update a user's details by their unique identifier.")
	@ApiResponses(value = {
			@ApiResponse(responseCode = "200", description = "User updated", content = @Content(schema = @Schema(implementation = User.class))),
			@ApiResponse(responseCode = "404", description = "User not found", content = @Content()) })
	public ResponseEntity<User> updateUser(@PathVariable Long id, @Valid @RequestBody User updatedUser) {
		try {
			User updated = userService.updateUser(id, updatedUser);
			return new ResponseEntity<>(updated, HttpStatus.OK);
		} catch (UsernameNotFoundException e) {
			return new ResponseEntity<>(HttpStatus.NOT_FOUND);
		}
	}

	@DeleteMapping("/{id}")
	@Operation(summary = "Delete user by ID", description = "Delete a user by their unique identifier.")
	@ApiResponses(value = { @ApiResponse(responseCode = "204", description = "User deleted"),
			@ApiResponse(responseCode = "404", description = "User not found", content = @Content()) })
	public ResponseEntity<Void> deleteUser(@PathVariable Long id) {
		try {
			userService.deleteUser(id);
			return new ResponseEntity<>(HttpStatus.NO_CONTENT);
		} catch (UsernameNotFoundException e) {
			return new ResponseEntity<>(HttpStatus.NOT_FOUND);
		}
	}
}