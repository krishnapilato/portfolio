package com.personal.portfolio.model;

import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;

import java.time.Instant;
import java.time.ZoneId;
import java.time.ZonedDateTime;
import java.util.*;

/**
 * Represents a user entity for the application, including authentication and
 * authorization details. Implements {@link UserDetails} to integrate with Spring Security.
 */
@Entity
@Table(
        name = "users",
        indexes = {
                @Index(name = "idx_user_email", columnList = "email"),
                @Index(name = "idx_user_enabled", columnList = "enabled")
        }
)
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@ToString
public class User implements UserDetails {

    private static final PasswordEncoder PASSWORD_ENCODER = new BCryptPasswordEncoder();

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(nullable = false)
    private Long id;

    @NotNull
    @Size(min = 2, max = 100, message = "Full name must be between 2 and 100 characters.")
    private String fullName;

    @NotNull
    @Email(message = "Please provide a valid email address.")
    @Column(unique = true, nullable = false)
    private String email;

    @NotNull
    @Size(min = 8, message = "Password must be at least 8 characters long.")
    @JsonIgnore
    private String password;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private Role role = Role.USER;

    @Column(unique = true)
    private String phoneNumber;

    @Column(nullable = false)
    private boolean enabled = true;

    @Column(nullable = false)
    private boolean locked = false;

    @Column(nullable = false)
    private boolean accountNonExpired = true;

    @Column(nullable = false)
    private boolean credentialsNonExpired = true;

    @JsonIgnore
    private Instant lastLogin;

    private String profilePictureUrl;

    @Size(max = 500, message = "Bio cannot exceed 500 characters.")
    private String bio;

    @CreationTimestamp
    @Column(updatable = false, nullable = false)
    private Date createdAt;

    @UpdateTimestamp
    @Column(nullable = false)
    private Date updatedAt;

    /**
     * Constructor for a basic user without optional fields.
     */
    public User(String fullName, String email, String password, Role role) {
        this.fullName = fullName;
        this.email = email;
        this.password = password;
        this.role = role;
        this.createdAt = new Date();
        this.updatedAt = new Date();
        this.lastLogin = Instant.now();
    }

    /**
     * Constructor for a full user entity including optional fields.
     */
    public User(String fullName, String email, String password, Role role, String phoneNumber,
                String profilePictureUrl, String bio) {
        this(fullName, email, password, role);
        this.phoneNumber = phoneNumber;
        this.profilePictureUrl = profilePictureUrl;
        this.bio = bio;
    }

    /**
     * Hash the password before saving to the database.
     */
    @PrePersist
    @PreUpdate
    private void hashPassword() {
        if (password != null && !password.matches("^(\\$2[aby]\\$\\d{2}\\$).{53}$")) {
            this.password = PASSWORD_ENCODER.encode(password);
        }
    }

    @Override
    public String getUsername() {
        return email;
    }

    @Override
    public boolean isEnabled() {
        if (!enabled) {
            return false;
        }
        Instant sixMonthsAgo = ZonedDateTime.now().minusMonths(6).toInstant();
        return lastLogin != null && lastLogin.isAfter(sixMonthsAgo);
    }

    @Override
    public boolean isAccountNonLocked() {
        return !locked;
    }

    @Override
    public boolean isAccountNonExpired() {
        if (!accountNonExpired) {
            return false;
        }

        Instant expirationTime = createdAt.toInstant().atZone(ZoneId.systemDefault()).plusYears(1).toInstant();
        return Instant.now().isBefore(expirationTime);
    }

    @Override
    public Collection<? extends GrantedAuthority> getAuthorities() {
        return Collections.singleton(new SimpleGrantedAuthority("ROLE_" + role.name()));
    }

    @Override
    public boolean equals(Object o) {
        if (this == o) return true;
        if (o == null || getClass() != o.getClass()) return false;
        User user = (User) o;
        return Objects.equals(id, user.id);
    }

    @Override
    public int hashCode() {
        return Objects.hash(id);
    }
}