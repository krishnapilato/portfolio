package com.personal.portfolio.service;

import java.time.Instant;
import java.util.Date;
import java.util.Optional;
import java.util.stream.Stream;

import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import com.personal.portfolio.model.Role;
import com.personal.portfolio.model.User;
import com.personal.portfolio.repository.UserRepository;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class UserService implements UserDetailsService {

	private final UserRepository userRepository;
	private final PasswordEncoder passwordEncoder;

	@Override
	public UserDetails loadUserByUsername(String email) throws UsernameNotFoundException {
		return userRepository.findByEmail(email)
				.orElseThrow(() -> new UsernameNotFoundException("User not found with email: " + email));
	}

	public Stream<User> getAllUsers() {
		return userRepository.findAll().stream();
	}

	public User toggleLock(Long id) {
		int updatedRows = userRepository.updateLockStatusById(id, !userRepository.findById(id)
				.orElseThrow(() -> new UsernameNotFoundException("User not found with id: " + id)).isLocked());

		if (updatedRows == 0) {
			throw new UsernameNotFoundException("User not found with id: " + id);
		}

		return userRepository.findById(id)
				.orElseThrow(() -> new UsernameNotFoundException("User not found with id: " + id));
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
			user.setPassword(passwordEncoder.encode(updatedUser.getPassword()));
			user.setUpdatedAt(Date.from(Instant.now()));
			return userRepository.save(user);
		}).orElseThrow(() -> new UsernameNotFoundException("User not found with id: " + id));
	}

	public void deleteUser(Long id) {
		userRepository.deleteById(id);
	}
}