package com.personal.portfolio.service;

import com.personal.portfolio.model.Role;
import com.personal.portfolio.model.User;
import com.personal.portfolio.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.time.Instant;
import java.util.Date;
import java.util.List;
import java.util.Optional;

/**
 * Service layer for managing users.
 * Provides functionality for user operations such as CRUD, lock toggling, and password encoding.
 */
@Service
@RequiredArgsConstructor
public class UserService implements UserDetailsService {

    private static final Logger logger = LoggerFactory.getLogger(UserService.class);

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    private static final String USER_NOT_FOUND = "User not found with id: ";

    /**
     * Load a user by their email for authentication.
     *
     * @param email The email of the user
     * @return The UserDetails object for Spring Security
     * @throws UsernameNotFoundException If no user is found with the given email
     */
    @Override
    public UserDetails loadUserByUsername(String email) throws UsernameNotFoundException {
        logger.info("Attempting to load user by email: {}", email);

        return userRepository.findByEmail(email).map(user -> {
            logger.info("User found with email: {}", email);
            return user;
        }).orElseThrow(() -> {
            logger.warn("User not found with email: {}", email);
            return new UsernameNotFoundException("User not found with email: " + email);
        });
    }

    /**
     * Retrieve all users from the database. Results are cached to improve performance.
     *
     * @return A list of all users
     */
    @Cacheable(value = "users", unless = "#result.size() == 0", key = "'all_users'")
    public List<User> getAllUsers() {
        return userRepository.findAll();
    }

    /**
     * Toggle the lock status of a user account (lock or unlock).
     *
     * @param id The ID of the user
     * @return The updated user object
     * @throws UsernameNotFoundException If no user is found with the given ID
     */
    public User toggleLock(Long id) {
        // Retrieve the user or throw an exception if not found
        User user = userRepository.findById(id).orElseThrow(() -> new UsernameNotFoundException(USER_NOT_FOUND + id));

        // Toggle the lock status
        boolean newLockStatus = !user.isLocked();
        user.setLocked(newLockStatus);

        // Save the updated user entity back to the database
        return userRepository.save(user);
    }

    /**
     * Retrieve a user by their ID.
     *
     * @param id The ID of the user
     * @return An Optional containing the user if found, or empty if not found
     */
    public Optional<User> getUserById(Long id) {
        return userRepository.findById(id);
    }

    /**
     * Creates a new user. The password is encoded and a default role is set if not provided.
     *
     * @param user The user object to be created
     * @return The created user
     */
    public User createUser(User user) {
        // Encode the user's password
        user.setPassword(passwordEncoder.encode(user.getPassword()));

        // Set the default role if not provided
        user.setRole(user.getRole() == null ? Role.USER : user.getRole());

        // Save and return the newly created user
        return userRepository.save(user);
    }

    /**
     * Checks if a user with the given email already exists.
     *
     * @param email The email to check
     * @return True if a user with the email exists, otherwise false
     */
    public boolean existsByEmail(String email) {
        // Return the result directly from the repository check
        return userRepository.existsByEmail(email);
    }

    /**
     * Update an existing user's details.
     *
     * @param id          The ID of the user to update
     * @param updatedUser The updated user object
     * @return The updated user
     * @throws UsernameNotFoundException If no user is found with the given ID
     */
    public User updateUser(Long id, User updatedUser) {
        return userRepository.findById(id).map(user -> {
            updateUserDetails(user, updatedUser);
            return userRepository.save(user);
        }).orElseThrow(() -> new UsernameNotFoundException(USER_NOT_FOUND + id));
    }

    /**
     * Helper method to update user details.
     *
     * @param user        The user to be updated
     * @param updatedUser The new details to update
     */
    private void updateUserDetails(User user, User updatedUser) {
        user.setFullName(updatedUser.getFullName());
        user.setEmail(updatedUser.getEmail());
        if (updatedUser.getPassword() != null) {
            user.setPassword(passwordEncoder.encode(updatedUser.getPassword()));
        }
        user.setUpdatedAt(Date.from(Instant.now()));
    }

    /**
     * Delete a user by their ID.
     *
     * @param id The ID of the user to delete
     * @throws UsernameNotFoundException If no user is found with the given ID
     */
    public void deleteUser(Long id) {
        userRepository.findById(id).ifPresentOrElse(user -> {
            userRepository.delete(user);
            logger.info("User deleted successfully with ID: {}", id);
        }, () -> {
            throw new UsernameNotFoundException(USER_NOT_FOUND + id);
        });
    }
}