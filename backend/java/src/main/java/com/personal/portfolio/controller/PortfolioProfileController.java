package com.personal.portfolio.controller;

import java.util.Map;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.personal.portfolio.model.Profile;
import com.personal.portfolio.service.ProfileService;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;

@RestController
@RequestMapping("/profile")
@Tag(name = "Portfolio Profile", description = "Endpoints for getting profile data and add properties")
public class PortfolioProfileController  {
	private final ProfileService profileService;

    public PortfolioProfileController(ProfileService profileService) {
        this.profileService = profileService;
    }

    @GetMapping
    @Operation(summary = "Get user data", description = "Get user profile data.")
    public Profile getProfile() {
        return profileService.getProfile();
    }

    @PutMapping
    @Operation(summary = "Update user data", description = "Update user profile data (partial updates allowed)..")
    public Profile createOrUpdateProfile(@RequestBody Profile profile) {
    	return profileService.updateProfile(profile);
    }

    @PostMapping("/properties") 
    public void addProperty(@RequestBody Map<String, String> properties) {
        profileService.addProperty(1L, properties);
    }

    @GetMapping("/properties")
    @Operation(summary = "Get properties", description = "Get all properties of profile data.")
    public Map<String, String> getAllProperties() {
        return profileService.getPropertiesByProfileId(1L);
    }
}