package com.personal.portfolio.service;

import java.util.List;
import java.util.Optional;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import com.personal.portfolio.model.Role;
import com.personal.portfolio.model.User;
import com.personal.portfolio.repository.UserRepository;

@Service
public class UserService implements UserDetailsService {

	@Autowired
	private UserRepository userRepository;

	@Autowired
	private PasswordEncoder passwordEncoder;

	@Override
	public UserDetails loadUserByUsername(String email) throws UsernameNotFoundException {
		return userRepository.findByEmail(email)
				.orElseThrow(() -> new UsernameNotFoundException("User not found with email: " + email));
	}
	
	
	public List<User> getAllUsers() {
		return userRepository.findAll();
	}
	
	public User toggleLock(Long id) {
	    User user = userRepository.findById(id)
	            .orElseThrow(() -> new UsernameNotFoundException("User not found with id: " + id));
	    user.setLocked(!user.isLocked());
	    return userRepository.save(user);
	}

	public Optional<User> getUserById(Long id) {
		return userRepository.findById(id);
	}

	public User createUser(User user) {
		String hashedPassword = passwordEncoder.encode(user.getPassword());
		user.setPassword(hashedPassword);
		if (user.getRole() == null) {
			user.setRole(Role.USER);
		}
		return userRepository.save(user);
	}

	public User updateUser(Long id, User updatedUser) {
		return userRepository.findById(id).map(user -> {
			user.setFullName(updatedUser.getFullName());
			return userRepository.save(user);
		}).orElseThrow(() -> new UsernameNotFoundException("User not found with id: " + id));
	}

	public void deleteUser(Long id) {
		userRepository.deleteById(id);
	}
}