package com.personal.portfolio.model;

import java.util.Collection;
import java.util.Date;
import java.util.HashSet;
import java.util.Set;

import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.userdetails.UserDetails;

import com.fasterxml.jackson.annotation.JsonIgnore;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;

import lombok.Data;
import lombok.NoArgsConstructor;

@Table(name = "users")
@Entity
@Data
@NoArgsConstructor
public class User implements UserDetails {

	@Id
	@GeneratedValue(strategy = GenerationType.AUTO)
	@Column(nullable = false)
	private Long id;

	@Column(nullable = false, length = 100)
	private String fullName;

	@Column(unique = true, length = 100, nullable = false)
	private String email;

	@Column(nullable = false)
	@JsonIgnore
	private String password;

	@Enumerated(EnumType.STRING)
	@Column(name = "role")
	private Role role = Role.USER;

	@Column(name = "enabled")
	private boolean enabled = true;

	@Column(name = "locked")
	private boolean locked = false;

	@Column(name = "account_non_expired")
	private boolean accountNonExpired = true;

	@Column(name = "credentials_non_expired")
	private boolean credentialsNonExpired = true;

	@CreationTimestamp
	@Column(updatable = false, name = "created_at")
	private Date createdAt;

	@UpdateTimestamp
	@Column(name = "updated_at")
	private Date updatedAt;

	@Override
	public String getUsername() {
		return email;
	}

	@Override
	public boolean isEnabled() {
		return this.enabled;
	}

	@Override
	public boolean isAccountNonLocked() {
		return !this.locked;
	}

	@Override
	public boolean isAccountNonExpired() {
		return this.accountNonExpired;
	}

	@Override
	public Collection<? extends GrantedAuthority> getAuthorities() {
		Set<GrantedAuthority> authorities = new HashSet<>();
		authorities.add(new SimpleGrantedAuthority(role.name()));
		return authorities;
	}

	@Override
	public boolean equals(Object o) {
		if (this == o) return true;
		if (!(o instanceof User user)) return false;
		return id != null && id.equals(user.id);
	}

	@Override
	public int hashCode() {
		return getClass().hashCode();
	}
}