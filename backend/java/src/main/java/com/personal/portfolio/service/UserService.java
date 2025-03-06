package com.personal.portfolio.service;

import com.personal.portfolio.model.Role;
import com.personal.portfolio.model.User;
import com.personal.portfolio.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.cache.annotation.CacheEvict;
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
 */
@Service
@RequiredArgsConstructor
public class UserService implements UserDetailsService {

    private static final Logger logger = LoggerFactory.getLogger(UserService.class);
    private static final String USER_NOT_FOUND = "User not found with ID: ";

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final EmailService emailService;

    @Override
    public UserDetails loadUserByUsername(String email) {
        return userRepository.findByEmail(email)
                .orElseThrow(() -> new UsernameNotFoundException("User not found with email: " + email));
    }

    @Cacheable(value = "users", unless = "#result.isEmpty()", key = "'all_users'")
    public List<User> getAllUsers() {
        return userRepository.findAll();
    }

    @Cacheable(value = "users", key = "#id")
    public Optional<User> getUserById(Long id) {
        return userRepository.findById(id);
    }

    @Cacheable(value = "emailExistenceCache", key = "#email")
    public boolean existsByEmail(String email) {
        return userRepository.existsByEmail(email);
    }

    public User createUser(User user) {
        user.setPassword(passwordEncoder.encode(user.getPassword()));
        user.setEnabled(false);
        user.setRole(Optional.ofNullable(user.getRole()).orElse(Role.USER));
        user.setCreatedAt(Date.from(Instant.now()));
        user.setUpdatedAt(Date.from(Instant.now()));
        return userRepository.save(user);
    }

    @CacheEvict(value = "users", key = "#id")
    public User updateUser(Long id, User updatedUser) {
        return userRepository.findById(id)
                .map(user -> saveUpdatedUser(user, updatedUser))
                .orElseThrow(() -> new UsernameNotFoundException(USER_NOT_FOUND + id));
    }

    @CacheEvict(value = "users", key = "#id")
    public void deleteUser(Long id) {
        userRepository.findById(id).ifPresentOrElse(
                user -> {
                    userRepository.delete(user);
                    logger.info("User deleted successfully with ID: {}", id);
                },
                () -> { throw new UsernameNotFoundException(USER_NOT_FOUND + id); }
        );
    }

    public void resetPassword(String email, String newPassword) {
        userRepository.findByEmail(email).ifPresentOrElse(
                user -> saveUpdatedUser(user, newPassword),
                () -> { throw new UsernameNotFoundException("User not found with email: " + email); }
        );
    }

    public User toggleLock(Long id) {
        return userRepository.findById(id)
                .map(user -> {
                    user.setLocked(!user.isLocked());
                    return userRepository.save(user);
                })
                .orElseThrow(() -> new UsernameNotFoundException(USER_NOT_FOUND + id));
    }

    public User changeUserRole(Long id, Role role) {
        return userRepository.findById(id)
                .map(user -> {
                    user.setRole(role);
                    return saveUpdatedUser(user);
                })
                .orElseThrow(() -> new UsernameNotFoundException(USER_NOT_FOUND + id));
    }

    public User activateUserAccount(Long id) {
        return userRepository.findById(id)
                .map(user -> {
                    user.setEnabled(true);
                    return saveUpdatedUser(user);
                })
                .orElseThrow(() -> new UsernameNotFoundException(USER_NOT_FOUND + id));
    }

    private User saveUpdatedUser(User user, User updatedUser) {
        user.setFullName(updatedUser.getFullName());
        user.setEmail(updatedUser.getEmail());
        if (updatedUser.getPassword() != null) {
            user.setPassword(passwordEncoder.encode(updatedUser.getPassword()));
        }
        return saveUpdatedUser(user);
    }

    private User saveUpdatedUser(User user) {
        user.setUpdatedAt(Date.from(Instant.now()));
        return userRepository.save(user);
    }

    private void saveUpdatedUser(User user, String newPassword) {
        user.setPassword(passwordEncoder.encode(newPassword));
        saveUpdatedUser(user);
        logger.info("Password reset successfully for email: {}", user.getEmail());
    }
}