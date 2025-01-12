package com.personal.portfolio.controller;

import com.personal.portfolio.model.User;
import com.personal.portfolio.service.UserService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.web.bind.annotation.*;

import java.net.URI;
import java.util.List;

/**
 * Controller to handle user-related operations.
 * Provides endpoints for CRUD operations and user account management.
 */
@RestController
@RequestMapping("/api/users")
@RequiredArgsConstructor
@Tag(name = "Users", description = "Endpoints for managing user data.")
public class UserController {

    private static final Logger logger = LoggerFactory.getLogger(UserController.class);

    private final UserService userService;

    /**
     * Retrieve a list of all registered users.
     *
     * @return ResponseEntity containing the list of users or 500 if an error occurs
     */
    @GetMapping
    @Operation(summary = "Get all users", description = "Retrieve a list of all registered users.")
    public ResponseEntity<List<User>> getAllUsers() {
        try {
            List<User> users = userService.getAllUsers();
            if (users.isEmpty()) {
                logger.warn("No users found in the system.");
                return ResponseEntity.noContent().build(); // Returns 204 if no users are found
            }
            logger.info("Retrieved {} users from the database.", users.size());
            return ResponseEntity.ok(users);
        } catch (Exception e) {
            logger.error("Error retrieving users: {}", e.getMessage(), e); // Logs error if there's an exception
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build(); // Returns 500 in case of error
        }
    }

    @GetMapping("/{id}")
    @Operation(summary = "Get user by ID", description = "Retrieve a user by ID.")
    @Cacheable(value = "users", key = "#id")
    public ResponseEntity<User> getUserById(@PathVariable Long id) {
        return userService.getUserById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    /**
     * Register a new user.
     *
     * @param newUser User object to be created
     * @return ResponseEntity containing the created user and the location URI, or an error message if a user already exists
     */
    @PostMapping
    @Operation(summary = "Create a new user", description = "Registers a new user in the system.")
    public ResponseEntity<?> createUser(@Valid @RequestBody User newUser) {
        try {
            // Check if the user already exists based on unique fields like email
            if (userService.existsByEmail(newUser.getEmail())) {
                logger.warn("User creation failed, email already exists: {}", newUser.getEmail());
                return ResponseEntity.status(HttpStatus.CONFLICT).body("User with this email already exists.");
            }

            // Proceed with user creation if no conflict
            User createdUser = userService.createUser(newUser);
            URI location = URI.create("/api/users/" + createdUser.getId());
            logger.info("User created successfully with ID: {}", createdUser.getId());
            return ResponseEntity.created(location).body(createdUser);
        } catch (Exception e) {
            // Handle unexpected errors, log them, and return a generic error response
            logger.error("Unexpected error occurred while creating user: {}", e.getMessage(), e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body("An error occurred while creating the user.");
        }
    }

    /**
     * Update an existing user's details by their ID.
     *
     * @param id          User ID
     * @param updatedUser Updated User object
     * @return ResponseEntity containing the updated user or 404 if the user is not found
     */
    @PutMapping("/{id}")
    @Operation(summary = "Update user by ID", description = "Update a user's details by their ID.")
    public ResponseEntity<User> updateUser(@PathVariable("id") Long id, @Valid @RequestBody User updatedUser) {
        if (id == null || updatedUser == null) {
            logger.warn("Update failed: Invalid user ID or empty user details.");
            return ResponseEntity.badRequest().build();
        }

        try {
            User user = userService.updateUser(id, updatedUser);
            logger.info("User updated successfully with ID: {}", user.getId());
            return ResponseEntity.ok(user);
        } catch (UsernameNotFoundException e) {
            logger.warn("Update failed for user with ID: {} - {}", id, e.getMessage());
            return ResponseEntity.status(HttpStatus.NOT_FOUND).build();
        } catch (Exception e) {
            logger.error("Unexpected error occurred while updating user with ID: {} - {}", id, e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    /**
     * Lock or unlock a user account.
     *
     * @param id User ID
     * @return ResponseEntity containing the updated user or 404 if the user is not found
     */
    @PutMapping("/{id}/lock")
    @Operation(summary = "Toggle user lock status", description = "Locks or unlocks a user account by toggling the lock status.")
    public ResponseEntity<User> toggleLockUser(@PathVariable("id") Long id) {
        if (id == null) {
            logger.warn("Toggle lock failed: User ID is null.");
            return ResponseEntity.badRequest().build();
        }

        try {
            User user = userService.toggleLock(id);
            logger.info("User lock status toggled successfully for ID: {}", user.getId());
            return ResponseEntity.ok(user);
        } catch (UsernameNotFoundException e) {
            logger.warn("Toggle lock failed for user with ID: {} - {}", id, e.getMessage());
            return ResponseEntity.status(HttpStatus.NOT_FOUND).build();
        } catch (Exception e) {
            logger.error("Unexpected error occurred while toggling lock status for user with ID: {} - {}", id, e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    /**
     * Deletes a user by their ID.
     *
     * @param id User ID
     * @return ResponseEntity with no content if successful, or 404 if the user is not found
     */
    @DeleteMapping("/{id}")
    @Operation(summary = "Delete user by ID", description = "Delete a user by their unique ID.")
    public ResponseEntity<Void> deleteUser(@PathVariable("id") Long id) {
        if (id == null) {
            logger.warn("Delete failed: ID is null.");
            return ResponseEntity.badRequest().build();
        }

        try {
            userService.deleteUser(id);
            logger.info("User with ID: {} successfully deleted.", id);
            return ResponseEntity.noContent().build();
        } catch (UsernameNotFoundException e) {
            logger.warn("Delete failed for user with ID: {} - {}", id, e.getMessage());
            return ResponseEntity.notFound().build();
        } catch (Exception e) {
            logger.error("Unexpected error occurred while deleting user with ID: {} - {}", id, e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }
}