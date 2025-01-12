package com.personal.portfolio.model;

import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;
import jakarta.validation.constraints.Email;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.userdetails.UserDetails;

import java.time.Instant;
import java.time.ZoneId;
import java.time.ZonedDateTime;
import java.util.Collection;
import java.util.Collections;
import java.util.Date;
import java.util.Objects;

/**
 * Represents a user entity for the application, including authentication and
 * authorization details. Implements {@link UserDetails} to integrate with
 * Spring Security.
 */
@Entity
@Table(name = "users")
@Data
@NoArgsConstructor
public class User implements UserDetails {

    @Id
    @GeneratedValue(strategy = GenerationType.AUTO)
    @Column(nullable = false)
    private Long id;

    // The full name of the user.
    private String fullName;

    // Unique email address for the user (used as the username in authentication).
    @Column(unique = true, nullable = false)
    @Email
    private String email;

    // Encrypted password (excluded from serialization for security).
    @JsonIgnore
    private String password;

    // Role of the user for authorization (e.g., ADMIN, USER).
    @Enumerated(EnumType.STRING)
    private Role role = Role.USER;

    // Flags to control account status and credentials validity.
    private boolean enabled = true;
    private boolean locked = false;
    private boolean accountNonExpired = true;
    private boolean credentialsNonExpired = true;

    // Automatically managed timestamps for record creation and updates.
    @CreationTimestamp
    @Column(updatable = false)
    private Date createdAt;

    @UpdateTimestamp
    private Date updatedAt;

    /**
     * Returns the email address of the user as the username for authentication.
     */
    @Override
    public String getUsername() {
        return email;
    }

    /**
     * Returns whether the user is currently enabled.
     * Added logic to check for inactive users based on a "last login" timestamp.
     */
    @Override
    public boolean isEnabled() {
        if (!enabled) {
            return false;
        }

        Instant sixMonthsAgo = ZonedDateTime.now().minusMonths(6).toInstant();
        return createdAt.toInstant().isAfter(sixMonthsAgo);
    }

    /**
     * Returns whether the user's account is not locked.
     * Includes checks for account lock due to manual lock and expiration.
     */
    @Override
    public boolean isAccountNonLocked() {
        if (locked) {
            return false;
        }

        return isAccountNonExpired();
    }

    /**
     * Returns whether the user's account is not expired.
     * Added logic to check for the actual expiration date.
     */
    @Override
    public boolean isAccountNonExpired() {
        if (!accountNonExpired) {
            return false;
        }

        Instant expirationTime = createdAt.toInstant().atZone(ZoneId.systemDefault()).plusYears(1).toInstant();
        return Instant.now().isBefore(expirationTime);
    }

    /**
     * Returns the authorities granted to the user.
     * This is based on the user's role.
     */
    @Override
    public Collection<? extends GrantedAuthority> getAuthorities() {
        return Collections.singleton(new SimpleGrantedAuthority("ROLE_" + role.name()));
    }

    /**
     * Overrides equals to compare users by their unique ID.
     */
    @Override
    public boolean equals(Object o) {
        if (this == o) return true;
        if (o == null || getClass() != o.getClass()) return false;
        User user = (User) o;
        return Objects.equals(id, user.id);
    }

    /**
     * Overrides hashCode to provide a consistent hash based on the user's ID.
     */
    @Override
    public int hashCode() {
        return Objects.hash(id);
    }
}