package com.example.core.support;

import com.example.core.problem.ApiException;
import com.example.core.problem.NotFound;
import jakarta.validation.Valid;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/probe")
class ProbeController {

    static final String LEAKED_SECRET = "jdbc:mysql://db.internal:3306/data?password=hunter2";

    @GetMapping("/items/{id}")
    String item(@PathVariable String id) {
        throw new ApiException(new NotFound("Item", id));
    }

    @GetMapping("/admin")
    @PreAuthorize("hasRole('admin')")
    String admin() {
        return "admin";
    }

    @GetMapping("/open/greeting")
    String greeting() {
        return "hello";
    }

    @GetMapping("/failure")
    String failure() {
        throw new IllegalStateException(LEAKED_SECRET);
    }

    @PostMapping("/items")
    String create(@Valid @RequestBody Item item) {
        return item.name();
    }

    record Item(@NotBlank String name, @Size(max = 3) String code) {
    }
}
