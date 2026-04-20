package com.personal.portfolio.controller;

import com.personal.portfolio.dto.user.CreateUserRequest;
import com.personal.portfolio.dto.user.UpdateUserRequest;
import com.personal.portfolio.dto.user.UserResponse;
import com.personal.portfolio.model.Role;
import com.personal.portfolio.model.User;
import com.personal.portfolio.service.UserService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.net.URI;
import java.util.List;

@RestController
@RequestMapping("/api/users")
@RequiredArgsConstructor
@Tag(name = "Users", description = "Endpoints for managing user data.")
public class UserController {

    private final UserService userService;

    @GetMapping
    @Operation(summary = "Get all users")
    public ResponseEntity<List<UserResponse>> getAllUsers() {
        var users = userService.getAllUsers().stream()
                .map(UserResponse::from)
                .toList();
        return users.isEmpty() ? ResponseEntity.noContent().build() : ResponseEntity.ok(users);
    }

    @GetMapping("/{id}")
    @Operation(summary = "Get user by ID")
    public ResponseEntity<UserResponse> getUserById(@PathVariable Long id) {
        return userService.getUserById(id)
                .map(UserResponse::from)
                .map(ResponseEntity::ok)
                .orElseGet(() -> ResponseEntity.notFound().build());
    }

    @PostMapping
    @Operation(summary = "Create a new user")
    public ResponseEntity<UserResponse> createUser(@Valid @RequestBody CreateUserRequest newUser) {
        var createdUser = userService.createUser(User.builder()
                .fullName(newUser.fullName())
                .email(newUser.email())
                .password(newUser.password())
                .role(newUser.role())
                .phoneNumber(newUser.phoneNumber())
                .profilePictureUrl(newUser.profilePictureUrl())
                .bio(newUser.bio())
                .build());
        var location = URI.create("/api/users/" + createdUser.getId());
        return ResponseEntity.created(location).body(UserResponse.from(createdUser));
    }

    @PutMapping("/{id}")
    @Operation(summary = "Update user by ID")
    public ResponseEntity<UserResponse> updateUser(@PathVariable Long id, @Valid @RequestBody UpdateUserRequest updatedUser) {
        var user = userService.updateUser(id, User.builder()
                .fullName(updatedUser.fullName())
                .phoneNumber(updatedUser.phoneNumber())
                .profilePictureUrl(updatedUser.profilePictureUrl())
                .bio(updatedUser.bio())
                .build());
        return ResponseEntity.ok(UserResponse.from(user));
    }

    @PutMapping("/{id}/lock")
    @Operation(summary = "Toggle user lock status")
    public ResponseEntity<UserResponse> toggleLockUser(@PathVariable Long id) {
        return ResponseEntity.ok(UserResponse.from(userService.toggleLock(id)));
    }

    @DeleteMapping("/{id}")
    @Operation(summary = "Delete user by ID")
    public ResponseEntity<Void> deleteUser(@PathVariable Long id) {
        userService.deleteUser(id);
        return ResponseEntity.noContent().build();
    }

    @PutMapping("/{id}/role")
    @Operation(summary = "Change user role")
    public ResponseEntity<UserResponse> changeUserRole(@PathVariable Long id, @RequestParam Role role) {
        return ResponseEntity.ok(UserResponse.from(userService.changeUserRole(id, role)));
    }

    @PutMapping("/{id}/activate")
    @Operation(summary = "Activate user account")
    public ResponseEntity<UserResponse> activateUserAccount(@PathVariable Long id) {
        return ResponseEntity.ok(UserResponse.from(userService.activateUserAccount(id)));
    }
}
