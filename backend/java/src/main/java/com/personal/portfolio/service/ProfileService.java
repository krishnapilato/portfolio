package com.personal.portfolio.service;

import java.time.LocalDateTime;
import java.util.Map;

import org.springframework.stereotype.Service;

import com.personal.portfolio.model.Profile;
import com.personal.portfolio.repository.ProfileRepository;

@Service
public class ProfileService {
    private final ProfileRepository profileRepository;

    public ProfileService(ProfileRepository profileRepository) {
        this.profileRepository = profileRepository;
    }
    
    public Profile getProfile() {
        return profileRepository.findById(1L) 
                .orElseThrow(() -> new RuntimeException("Profile not found")); 
    }

    public Profile updateProfile(Profile updatedProfile) {
        Profile existingProfile = getProfile();

        if (updatedProfile.getFullName() != null && !updatedProfile.getFullName().isBlank()) {
            existingProfile.setFullName(updatedProfile.getFullName());
        }
        if (updatedProfile.getEmail() != null && !updatedProfile.getEmail().isBlank()) {
            existingProfile.setEmail(updatedProfile.getEmail());
        }
        if (updatedProfile.getPhoneNumber() != null && !updatedProfile.getPhoneNumber().isBlank()) {
            existingProfile.setPhoneNumber(updatedProfile.getPhoneNumber());
        }
        if (updatedProfile.getCurriculumVitaeDownloadUrl() != null && !updatedProfile.getCurriculumVitaeDownloadUrl().isBlank()) {
            existingProfile.setCurriculumVitaeDownloadUrl(updatedProfile.getCurriculumVitaeDownloadUrl());
        }
        if (updatedProfile.getLinkedinProfileUrl() != null && !updatedProfile.getLinkedinProfileUrl().isBlank()) {
            existingProfile.setLinkedinProfileUrl(updatedProfile.getLinkedinProfileUrl());
        }
        if (updatedProfile.getProperties() != null) {
            existingProfile.setProperties(updatedProfile.getProperties());
        }

        existingProfile.setUpdatedAt(LocalDateTime.now());
        return profileRepository.save(existingProfile);
    }

    public void addProperty(Long profileId, Map<String, String> properties) {
        Profile profile = profileRepository.findById(profileId)
                .orElseThrow(() -> new RuntimeException("Profile not found"));

        profile.getProperties().putAll(properties);
        profileRepository.save(profile);
    }

    public Map<String, String> getPropertiesByProfileId(Long profileId) {
        Profile profile = getProfile(); 
        return profile.getProperties();
    }
}