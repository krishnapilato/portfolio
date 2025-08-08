package com.personal.portfolio.service;

import com.personal.portfolio.model.Role;
import com.personal.portfolio.model.User;
import com.personal.portfolio.repository.UserRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.MockitoAnnotations;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.security.crypto.password.PasswordEncoder;

import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.BDDMockito.given;
import static org.mockito.BDDMockito.verify;

class UserServiceTest {

    @Mock
    private UserRepository userRepository;

    @Mock
    private PasswordEncoder passwordEncoder;

    @Mock
    private EmailService emailService;

    @InjectMocks
    private UserService userService;

    @BeforeEach
    void setup() {
        MockitoAnnotations.openMocks(this);
    }

    @Test
    void shouldLoadUserByUsername() {
        User user = User.builder().email("test@example.com").build();
        given(userRepository.findByEmail("test@example.com"))
                .willReturn(Optional.of(user));

        var loadedUser = userService.loadUserByUsername("test@example.com");

        assertThat(loadedUser).isNotNull();
        assertThat(((User) loadedUser).getEmail()).isEqualTo("test@example.com");
    }

    @Test
    void shouldThrowWhenUserNotFoundByEmail() {
        given(userRepository.findByEmail("missing@example.com"))
                .willReturn(Optional.empty());

        assertThatThrownBy(() -> userService.loadUserByUsername("missing@example.com"))
                .isInstanceOf(UsernameNotFoundException.class)
                .hasMessageContaining("missing@example.com");
    }

    @Test
    void shouldCreateUserWithEncodedPassword() {
        User user = User.builder()
                .email("new@example.com")
                .password("rawpassword")
                .build();

        given(passwordEncoder.encode("rawpassword"))
                .willReturn("encodedpassword");
        given(userRepository.save(any(User.class)))
                .willAnswer(invocation -> invocation.getArgument(0));

        User savedUser = userService.createUser(user);

        assertThat(savedUser.getPassword()).isEqualTo("encodedpassword");
        assertThat(savedUser.isEnabled()).isFalse();
        assertThat(savedUser.getRole()).isEqualTo(Role.USER);
    }

    @Test
    void shouldUpdateUser() {
        User existingUser = User.builder().id(1L).email("old@example.com").build();
        User updatedInfo = User.builder().email("new@example.com").build();

        given(userRepository.findById(1L)).willReturn(Optional.of(existingUser));
        given(userRepository.save(any(User.class)))
                .willAnswer(invocation -> invocation.getArgument(0));

        User updatedUser = userService.updateUser(1L, updatedInfo);

        assertThat(updatedUser.getEmail()).isEqualTo("new@example.com");
    }

    @Test
    void shouldDeleteUser() {
        User user = User.builder().id(1L).build();
        given(userRepository.findById(1L)).willReturn(Optional.of(user));

        userService.deleteUser(1L);

        verify(userRepository).delete(user);
    }

    @Test
    void shouldToggleUserLock() {
        User user = User.builder().id(1L).locked(false).build();
        given(userRepository.findById(1L)).willReturn(Optional.of(user));
        given(userRepository.save(any(User.class)))
                .willAnswer(invocation -> invocation.getArgument(0));

        User toggled = userService.toggleLock(1L);

        assertThat(toggled.isLocked()).isTrue();
    }

    @Test
    void shouldChangeUserRole() {
        User user = User.builder().id(1L).role(Role.USER).build();
        given(userRepository.findById(1L)).willReturn(Optional.of(user));
        given(userRepository.save(any(User.class)))
                .willAnswer(invocation -> invocation.getArgument(0));

        User updated = userService.changeUserRole(1L, Role.ADMIN);

        assertThat(updated.getRole()).isEqualTo(Role.ADMIN);
    }

    @Test
    void shouldActivateUserAccount() {
        User user = User.builder().id(1L).enabled(false).build();
        given(userRepository.findById(1L)).willReturn(Optional.of(user));
        given(userRepository.save(any(User.class)))
                .willAnswer(invocation -> invocation.getArgument(0));

        User activated = userService.activateUserAccount(1L);

        assertThat(activated.isEnabled()).isTrue();
    }

    @Test
    void shouldResetPassword() {
        User user = User.builder().id(1L).email("reset@example.com").build();
        given(userRepository.findByEmail("reset@example.com")).willReturn(Optional.of(user));
        given(passwordEncoder.encode("newpass")).willReturn("encodedNewPass");
        given(userRepository.save(any(User.class)))
                .willAnswer(invocation -> invocation.getArgument(0));

        userService.resetPassword("reset@example.com", "newpass");

        assertThat(user.getPassword()).isEqualTo("encodedNewPass");
    }

    @Test
    void shouldThrowWhenUserNotFoundById() {
        given(userRepository.findById(42L)).willReturn(Optional.empty());

        assertThatThrownBy(() -> userService.updateUser(42L, new User()))
                .isInstanceOf(UsernameNotFoundException.class)
                .hasMessageContaining("42");
    }
}