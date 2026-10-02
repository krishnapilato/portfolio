package com.personal.portfolio;

import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.boot.builder.SpringApplicationBuilder;
import org.springframework.boot.context.metrics.buffering.BufferingApplicationStartup;
import org.springframework.boot.context.properties.ConfigurationPropertiesScan;
import org.springframework.scheduling.annotation.EnableScheduling;

@SpringBootApplication
@ConfigurationPropertiesScan
@EnableScheduling
public class PortfolioApplication {

    static void main(String[] args) {
        // Records startup steps so /actuator/startup can show where boot time goes.
        new SpringApplicationBuilder(PortfolioApplication.class)
                .applicationStartup(new BufferingApplicationStartup(4096))
                .run(args);
    }
}
