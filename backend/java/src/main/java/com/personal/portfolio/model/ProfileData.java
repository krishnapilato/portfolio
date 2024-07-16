package com.personal.portfolio.model;

import lombok.Data;

import java.time.LocalDate;

import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

@Document(collection = "profile-data")
@Data
public class ProfileData {
    @Id
    private String id;

    private final String firstName;
    private final String lastName;
    private final LocalDate birthdate;
    
    
}
