package com.portfolio.portfolio.service;

import com.portfolio.portfolio.model.Role;
import com.portfolio.portfolio.model.User;
import com.portfolio.portfolio.repository.UserRepository;
import lombok.RequiredArgsConstructor;
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

@Service
@RequiredArgsConstructor
public class UserService implements UserDetailsService {

	private final UserRepository userRepository;
	private final PasswordEncoder passwordEncoder;

	private static final String USER_NOT_FOUND = "User not found with id: ";

	@Override
	public UserDetails loadUserByUsername(String email) throws UsernameNotFoundException {
		return userRepository.findByEmail(email)
				.orElseThrow(() -> new UsernameNotFoundException(USER_NOT_FOUND + email));
	}

	@Cacheable("users")
	public List<User> getAllUsers() {
		return userRepository.findAll();
	}

	public User toggleLock(Long id) {
		User user = userRepository.findById(id)
				.orElseThrow(() -> new UsernameNotFoundException(USER_NOT_FOUND + id));
		userRepository.updateLockStatusById(id);
		boolean newLockStatus = !user.isLocked();
		user.setLocked(newLockStatus);
		return user;
	}

	public Optional<User> getUserById(Long id) {
		return userRepository.findById(id);
	}

	public User createUser(User user) {
		user.setPassword(passwordEncoder.encode(user.getPassword()));
		user.setRole(user.getRole() == null ? Role.USER : user.getRole());
		return userRepository.save(user);
	}

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

	public void deleteUser(Long id) {
		if (!userRepository.existsById(id)) {
			throw new UsernameNotFoundException(USER_NOT_FOUND + id);
		}
		userRepository.deleteById(id);
	}
}