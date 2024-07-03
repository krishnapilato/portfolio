package com.personal.portfolio.dto;

public class RegistrationResponse {
    private String message;
    private Long userId;

    public RegistrationResponse(String message, Long userId) {
        this.message = message;
        this.userId = userId;
    }
    
    public String getMessage() {
        return message;
    }

    public Long getUserId() {
        return userId;
    }
}
