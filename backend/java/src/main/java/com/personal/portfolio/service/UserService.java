package com.personal.portfolio.service;

import java.time.Instant;
import java.util.Date;
import java.util.List;
import java.util.Optional;

import org.springframework.cache.annotation.Cacheable;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import com.personal.portfolio.model.Role;
import com.personal.portfolio.model.User;
import com.personal.portfolio.repository.UserRepository;

import lombok.RequiredArgsConstructor;

/**
 * Service layer for managing users.
 * Provides functionality for user operations such as CRUD, lock toggling, and password encoding.
 */
@Service
@RequiredArgsConstructor
public class UserService implements UserDetailsService {

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
		return userRepository.findByEmail(email)
				.orElseThrow(() -> new UsernameNotFoundException(USER_NOT_FOUND + email));
	}

	/**
	 * Retrieve all users from the database. Results are cached to improve performance.
	 *
	 * @return A list of all users
	 */
	@Cacheable("users")
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
		User user = userRepository.findById(id)
				.orElseThrow(() -> new UsernameNotFoundException(USER_NOT_FOUND + id));
		userRepository.updateLockStatusById(id);
		boolean newLockStatus = !user.isLocked();
		user.setLocked(newLockStatus);
		return user;
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
	 * Create a new user. The password is encoded and the default role is set if not provided.
	 *
	 * @param user The user object to be created
	 * @return The created user
	 */
	public User createUser(User user) {
		user.setPassword(passwordEncoder.encode(user.getPassword()));
		user.setRole(user.getRole() == null ? Role.USER : user.getRole());
		return userRepository.save(user);
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
			user.setFullName(updatedUser.getFullName());
			user.setEmail(updatedUser.getEmail());
			if (updatedUser.getPassword() != null) {
				user.setPassword(passwordEncoder.encode(updatedUser.getPassword()));
			}
			user.setUpdatedAt(Date.from(Instant.now()));
			return userRepository.save(user);
		}).orElseThrow(() -> new UsernameNotFoundException(USER_NOT_FOUND + id));
	}

	/**
	 * Delete a user by their ID.
	 *
	 * @param id The ID of the user to delete
	 * @throws UsernameNotFoundException If no user is found with the given ID
	 */
	public void deleteUser(Long id) {
		if (!userRepository.existsById(id)) {
			throw new UsernameNotFoundException(USER_NOT_FOUND + id);
		}
		userRepository.deleteById(id);
	}
}