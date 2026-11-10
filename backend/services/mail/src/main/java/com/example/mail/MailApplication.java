package com.example.mail;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.boot.context.properties.ConfigurationPropertiesScan;
import org.springframework.resilience.annotation.EnableResilientMethods;
import org.springframework.scheduling.annotation.EnableAsync;

@EnableAsync
@EnableResilientMethods
@SpringBootApplication
@ConfigurationPropertiesScan
public class MailApplication {

    static void main(String[] args) {
        SpringApplication.run(MailApplication.class, args);
    }
}
