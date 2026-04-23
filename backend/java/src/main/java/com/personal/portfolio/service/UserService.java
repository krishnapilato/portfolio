package com.personal.portfolio.service;

import com.personal.portfolio.model.Role;
import com.personal.portfolio.model.User;
import com.personal.portfolio.repository.PasswordResetTokenRepository;
import com.personal.portfolio.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Optional;
import java.util.Set;

@Slf4j
@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class UserService implements UserDetailsService {

    private static final Set<String> ALLOWED_SORT_FIELDS = Set.of(
            "createdAt",
            "updatedAt",
            "fullName",
            "email",
            "lastLogin"
    );

    private final UserRepository userRepository;
    private final PasswordResetTokenRepository passwordResetTokenRepository;
    private final PasswordEncoder passwordEncoder;

    @Override
    public UserDetails loadUserByUsername(String email) {
        return userRepository.findByEmail(email).orElseThrow(() -> new UsernameNotFoundException("User not found with email: " + email));
    }

    public Page<User> getUsers(Role role, Boolean enabled, Boolean locked, String search, int page, int size, String sortBy, Sort.Direction direction) {
        var normalizedSearch = normalizeSearch(search);
        var pageable = PageRequest.of(page, size, Sort.by(direction, resolveSortField(sortBy)));
        return userRepository.findAllByFilters(role, enabled, locked, normalizedSearch, pageable);
    }

    public Optional<User> getUserById(Long id) {
        return userRepository.findById(id);
    }

    public boolean existsByEmail(String email) {
        return userRepository.existsByEmail(email);
    }

    @Transactional
    public User createUser(User user) {
        if (userRepository.existsByEmail(user.getEmail())) {
            throw new DataIntegrityViolationException("User with email " + user.getEmail() + " already exists.");
        }

        user.setPassword(passwordEncoder.encode(user.getPassword()));
        user.setEnabled(false);
        if (user.getRole() == null) {
            user.setRole(Role.USER);
        }
        user.setLastLogin(null);
        return userRepository.save(user);
    }

    @Transactional
    public User updateUser(Long id, User updatedUser) {
        var user = getUserOrThrow(id);

        user.setFullName(updatedUser.getFullName());
        user.setPhoneNumber(updatedUser.getPhoneNumber());
        user.setProfilePictureUrl(updatedUser.getProfilePictureUrl());
        user.setBio(updatedUser.getBio());

        return userRepository.save(user);
    }

    @Transactional
    public void deleteUser(Long id) {
        var user = getUserOrThrow(id);
        passwordResetTokenRepository.deleteAllByUser(user);
        userRepository.delete(user);
        log.info("User deleted successfully with ID: {}", id);
    }

    @Transactional
    public User toggleLock(Long id) {
        var user = getUserOrThrow(id);
        user.setLocked(!user.isLocked());
        return userRepository.save(user);
    }

    @Transactional
    public User changeUserRole(Long id, Role role) {
        var user = getUserOrThrow(id);
        user.setRole(role);
        return userRepository.save(user);
    }

    @Transactional
    public User activateUserAccount(Long id) {
        var user = getUserOrThrow(id);
        user.setEnabled(true);
        return userRepository.save(user);
    }

    private User getUserOrThrow(Long id) {
        return userRepository.findById(id).orElseThrow(() -> new UsernameNotFoundException("User not found with ID: " + id));
    }

    private String normalizeSearch(String search) {
        if (search == null || search.isBlank()) {
            return null;
        }
        return search.trim();
    }

    private String resolveSortField(String sortBy) {
        if (!ALLOWED_SORT_FIELDS.contains(sortBy)) {
            throw new IllegalArgumentException("Unsupported sort field: " + sortBy);
        }
        return sortBy;
    }
}
