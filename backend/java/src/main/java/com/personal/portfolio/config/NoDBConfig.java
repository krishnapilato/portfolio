package com.personal.portfolio.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.context.annotation.Profile;
import javax.sql.DataSource;

@Configuration
@Profile("no-db")
public class NoDBConfig {

    @Bean
    public DataSource dataSource() {
        // Return a No-op DataSource to skip database connection
        return null;
    }
}