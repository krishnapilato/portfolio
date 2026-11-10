package com.example.seed;

import module java.base;

import org.springframework.http.HttpStatus;
import org.springframework.http.ProblemDetail;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/target")
public class TargetController {

    private final List<Map<String, Object>> received = new CopyOnWriteArrayList<>();

    public List<Map<String, Object>> received() {
        return received;
    }

    @PostMapping("/lists")
    Map<String, Object> list(@RequestBody Map<String, Object> body) {
        received.add(body);
        return Map.of("id", "list-" + body.get("name"), "size", 3);
    }

    @PostMapping("/lists/{id}/members")
    ResponseEntity<Void> member(@PathVariable String id, @RequestBody Map<String, Object> body) {
        var member = new LinkedHashMap<>(body);
        member.put("list", id);
        received.add(member);
        return ResponseEntity.accepted().build();
    }

    @GetMapping("/refuse")
    ResponseEntity<ProblemDetail> refuse() {
        return ResponseEntity.status(HttpStatus.CONFLICT).body(ProblemDetail.forStatusAndDetail(HttpStatus.CONFLICT, "Already there"));
    }
}
