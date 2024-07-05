package com.personal.portfolio.model;

import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.Map;

import jakarta.persistence.CollectionTable;
import jakarta.persistence.Column;
import jakarta.persistence.ElementCollection;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.MapKeyColumn;
import jakarta.persistence.Table;
import lombok.Data;

@Entity
@Table(name = "profiles")
@Data
public class Profile {
	@Id
	@GeneratedValue(strategy = GenerationType.IDENTITY)
	private Long id;
	
	@Column(name = "full_name", nullable = true)
	private String fullName;

	@Column(name = "email", nullable = true, unique = true)
	private String email;

	@Column(name = "phone_number", nullable = true)
	private String phoneNumber;

	@Column(name = "curriculum_vitae_download_url", nullable = true)
	private String curriculumVitaeDownloadUrl;

	@Column(name = "linkedin_profile_url", nullable = true)
	private String linkedinProfileUrl;

	@Column(name = "created_at", updatable = false, columnDefinition = "TIMESTAMP DEFAULT CURRENT_TIMESTAMP")
	private LocalDateTime createdAt;

	@Column(name = "updated_at", columnDefinition = "TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP")
	private LocalDateTime updatedAt;

    @ElementCollection 
    @CollectionTable(name = "profile_properties", joinColumns = @JoinColumn(name = "profile_id"))
    @MapKeyColumn(name = "property_key")
    @Column(name = "property_value")
    private Map<String, String> properties = new HashMap<>();  
}