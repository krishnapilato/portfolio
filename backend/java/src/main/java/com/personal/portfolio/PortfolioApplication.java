package com.personal.portfolio;

import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.boot.builder.SpringApplicationBuilder;
import org.springframework.boot.context.metrics.buffering.BufferingApplicationStartup;
import org.springframework.boot.context.properties.ConfigurationPropertiesScan;
import org.springframework.resilience.annotation.EnableResilientMethods;
import org.springframework.scheduling.annotation.EnableScheduling;

@SpringBootApplication
@ConfigurationPropertiesScan
@EnableScheduling
@EnableResilientMethods
public class PortfolioApplication {

    public static void main(String[] args) {
        new SpringApplicationBuilder(PortfolioApplication.class)
                .applicationStartup(new BufferingApplicationStartup(4096))
                .run(args);
    }
}
