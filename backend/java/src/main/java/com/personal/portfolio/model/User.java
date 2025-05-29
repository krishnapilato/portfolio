package com.personal.portfolio.model;

import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.*;
import org.hibernate.validator.constraints.URL;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.annotation.LastModifiedDate;
import org.springframework.data.jpa.domain.support.AuditingEntityListener;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;

import java.time.Instant;
import java.time.ZoneId;
import java.time.ZonedDateTime;
import java.util.*;
import java.util.regex.Pattern;

/**
 * Represents a user entity for the application, including authentication and
 * authorization details. Implements {@link UserDetails} to integrate with Spring Security.
 * Uses Lombok for boilerplate code reduction and Spring Data JPA for persistence.
 */
@Entity
@Table(
        name = "users",
        uniqueConstraints = { // Define unique constraints at the table level
                @UniqueConstraint(name = "uc_user_email", columnNames = {"email"})
        },
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
@Builder // Enables the Builder pattern for object creation
@EntityListeners(AuditingEntityListener.class) // Enables Spring Data JPA auditing for createdAt/updatedAt
@EqualsAndHashCode(of = "id") // Ensures equals and hashCode only use the ID for proper JPA entity behavior
public class User implements UserDetails {

    // Precompiled pattern for BCrypt hash verification.
    private static final Pattern BCRYPT_PATTERN = Pattern.compile("^(\\$2[aby]\\$\\d{2}\\$).{53}$");

    // Static password encoder for hashing passwords
    private static final PasswordEncoder PASSWORD_ENCODER = new BCryptPasswordEncoder();

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id", nullable = false, updatable = false)
    private Long id;

    @NotBlank(message = "Full name is required.")
    @Size(min = 2, max = 100, message = "Full name must be between 2 and 100 characters.")
    @Column(name = "full_name", nullable = false, length = 100)
    private String fullName;

    @NotBlank(message = "Email is required.")
    @Email(message = "Please provide a valid email address.")
    @Column(name = "email", unique = true, nullable = false, length = 255)
    private String email;

    @NotBlank(message = "Password is required.")
    @Size(min = 8, max = 255, message = "Password must be at least 8 characters long and at most 255 characters.")
    @JsonIgnore
    @Column(name = "password", nullable = false, length = 255)
    private String password;

    @Enumerated(EnumType.STRING)
    @Column(name = "role", nullable = false, length = 20)
    private Role role = Role.USER;

    @Size(max = 20, message = "Phone number cannot exceed 20 characters.")
    @jakarta.validation.constraints.Pattern(regexp = "^\\+?[0-9\\s\\-()]{7,20}$", message = "Please provide a valid phone number format.")
    @Column(name = "phone_number", unique = true, length = 20)
    private String phoneNumber;

    @Column(name = "enabled", nullable = false)
    private boolean enabled = true;

    @Column(name = "locked", nullable = false)
    private boolean locked = false;

    @Column(name = "account_non_expired", nullable = false)
    private boolean accountNonExpired = true;

    @Column(name = "credentials_non_expired", nullable = false)
    private boolean credentialsNonExpired = true;

    @JsonIgnore
    @Column(name = "last_login") // Explicit column name
    private Instant lastLogin;

    @URL(message = "Profile picture URL must be a valid URL.") // URL validation
    @Size(max = 500, message = "Profile picture URL cannot exceed 500 characters.")
    @Column(name = "profile_picture_url", length = 500) // Explicit column name and length
    private String profilePictureUrl;

    @Size(max = 500, message = "Bio cannot exceed 500 characters.")
    @Column(name = "bio", length = 500) // Explicit column name and length
    private String bio;

    @CreatedDate // Spring Data JPA annotation for creation timestamp
    @Column(name = "created_at", updatable = false, nullable = false) // Explicit column name and non-updatable
    private Date createdAt;

    @LastModifiedDate // Spring Data JPA annotation for last modified timestamp
    @Column(name = "updated_at", nullable = false) // Explicit column name
    private Date updatedAt;

    /**
     * Constructor for a basic user without optional fields.
     * Used by Lombok's @NoArgsConstructor and @AllArgsConstructor, but kept for clarity if needed explicitly.
     */
    // Note: With @Builder and @NoArgsConstructor/@AllArgsConstructor, explicit constructors are often less necessary.
    // However, keeping them if there's a specific reason for direct instantiation.
    public User(String fullName, String email, String password, Role role) {
        this.fullName = fullName;
        this.email = email;
        this.password = password;
        this.role = role;
        this.createdAt = new Date(); // Handled by @CreatedDate with AuditingEntityListener
        this.updatedAt = new Date(); // Handled by @LastModifiedDate with AuditingEntityListener
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
     * Hash the password before saving or updating to the database.
     * This method ensures that passwords are always hashed and not re-hashed if already hashed.
     */
    @PrePersist
    @PreUpdate
    private void hashPassword() {
        if (password != null && !BCRYPT_PATTERN.matcher(password).matches()) {
            this.password = PASSWORD_ENCODER.encode(password);
        }
    }

    @Override
    public String getUsername() {
        return email;
    }

    @Override
    public Collection<? extends GrantedAuthority> getAuthorities() {
        return Collections.singleton(new SimpleGrantedAuthority("ROLE_" + role.name()));
    }

    @Override
    public boolean isAccountNonExpired() {
        // If explicitly set to false, return false.
        if (!accountNonExpired) {
            return false;
        }
        // Account expires 1 year after creation.
        Instant expirationTime = createdAt.toInstant().atZone(ZoneId.systemDefault()).plusYears(1).toInstant();
        return Instant.now().isBefore(expirationTime);
    }

    @Override
    public boolean isAccountNonLocked() {
        return !locked;
    }

    @Override
    public boolean isCredentialsNonExpired() {
        return credentialsNonExpired;
    }

    @Override
    public boolean isEnabled() {
        // If explicitly set to false, return false.
        if (!enabled) {
            return false;
        }
        // Account is disabled if the last login was more than 6 months ago.
        Instant sixMonthsAgo = ZonedDateTime.now().minusMonths(6).toInstant();
        return lastLogin != null && lastLogin.isAfter(sixMonthsAgo);
    }
}