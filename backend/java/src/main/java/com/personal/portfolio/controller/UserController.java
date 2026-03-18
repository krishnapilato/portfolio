package com.personal.portfolio.controller;

import com.personal.portfolio.model.Role;
import com.personal.portfolio.model.User;
import com.personal.portfolio.service.UserService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.net.URI;
import java.util.List;

@Slf4j
@RestController
@RequestMapping("/api/users")
@RequiredArgsConstructor
@Tag(name = "Users", description = "Endpoints for managing user data.")
public class UserController {

    private final UserService userService;

    @GetMapping
    @Operation(summary = "Get all users")
    public ResponseEntity<List<User>> getAllUsers() {
        var users = userService.getAllUsers();
        return users.isEmpty() ? ResponseEntity.noContent().build() : ResponseEntity.ok(users);
    }

    @GetMapping("/{id}")
    @Operation(summary = "Get user by ID")
    public ResponseEntity<User> getUserById(@PathVariable Long id) {
        return userService.getUserById(id)
                .map(ResponseEntity::ok)
                .orElseGet(() -> ResponseEntity.notFound().build());
    }

    @PostMapping
    @Operation(summary = "Create a new user")
    public ResponseEntity<?> createUser(@Valid @RequestBody User newUser) {
        if (userService.existsByEmail(newUser.getEmail())) {
            log.warn("User creation failed, email already exists: {}", newUser.getEmail());
            // Note: Ideally, throw a custom UserAlreadyExistsException and handle via @RestControllerAdvice
            return ResponseEntity.status(HttpStatus.CONFLICT).body("User with this email already exists.");
        }

        var createdUser = userService.createUser(newUser);
        var location = URI.create("/api/users/" + createdUser.getId());
        return ResponseEntity.created(location).body(createdUser);
    }

    @PutMapping("/{id}")
    @Operation(summary = "Update user by ID")
    public ResponseEntity<User> updateUser(@PathVariable Long id, @Valid @RequestBody User updatedUser) {
        return ResponseEntity.ok(userService.updateUser(id, updatedUser));
    }

    @PutMapping("/{id}/lock")
    @Operation(summary = "Toggle user lock status")
    public ResponseEntity<User> toggleLockUser(@PathVariable Long id) {
        return ResponseEntity.ok(userService.toggleLock(id));
    }

    @DeleteMapping("/{id}")
    @Operation(summary = "Delete user by ID")
    public ResponseEntity<Void> deleteUser(@PathVariable Long id) {
        userService.deleteUser(id);
        return ResponseEntity.noContent().build();
    }

    @PostMapping("/reset-password")
    @Operation(summary = "Reset user password")
    public ResponseEntity<Void> resetPassword(@RequestParam String email, @RequestParam String newPassword) {
        userService.resetPassword(email, newPassword);
        return ResponseEntity.ok().build();
    }

    @PutMapping("/{id}/role")
    @Operation(summary = "Change user role")
    public ResponseEntity<User> changeUserRole(@PathVariable Long id, @RequestParam Role role) {
        return ResponseEntity.ok(userService.changeUserRole(id, role));
    }

    @PutMapping("/{id}/activate")
    @Operation(summary = "Activate user account")
    public ResponseEntity<User> activateUserAccount(@PathVariable Long id) {
        return ResponseEntity.ok(userService.activateUserAccount(id));
    }
}