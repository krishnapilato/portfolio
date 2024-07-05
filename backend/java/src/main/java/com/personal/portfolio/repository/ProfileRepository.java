package com.personal.portfolio.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import com.personal.portfolio.model.Profile;

@Repository
public interface ProfileRepository extends JpaRepository<Profile, Long> {
    @Modifying
    @Query("UPDATE Profile p SET p.fullName = :#{#profile.fullName}, p.email = :#{#profile.email}, " +
            "p.phoneNumber = :#{#profile.phoneNumber}, p.curriculumVitaeDownloadUrl = :#{#profile.curriculumVitaeDownloadUrl}, " +
            "p.linkedinProfileUrl = :#{#profile.linkedinProfileUrl}, p.properties = :#{#profile.properties} " + 
            "WHERE p.id = 1") // Update all fields for the single row
    void updateProfile(@Param("profile") Profile profile);
}
