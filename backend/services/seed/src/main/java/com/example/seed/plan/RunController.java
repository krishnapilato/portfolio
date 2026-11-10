package com.example.seed.plan;

import com.example.seed.plan.Seeder.Report;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.jspecify.annotations.Nullable;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@Tag(name = "Runs", description = "Run a plan, in YAML or JSON. Pass `seed` to get the same made-up data every time. Administrators only.")
@RestController
@PreAuthorize("hasRole('admin')")
@RequiredArgsConstructor
class RunController {

    private final Plans plans;
    private final Seeder seeder;

    @PostMapping(path = "/api/v1/runs", consumes = {"application/yaml", "application/json", "text/plain"})
    ResponseEntity<Report> run(@RequestBody String plan, @RequestParam @Nullable Long seed) {
        var report = seeder.run(plans.read(plan), seed);
        return ResponseEntity.status(report.completed() ? HttpStatus.OK : HttpStatus.BAD_GATEWAY).body(report);
    }
}
