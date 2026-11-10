package com.example.seed.plan;

import module java.base;

import com.example.core.problem.ApiException;
import com.example.core.problem.Problem;
import jakarta.validation.ConstraintViolation;
import jakarta.validation.Validator;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Component;
import tools.jackson.core.JacksonException;
import tools.jackson.dataformat.yaml.YAMLMapper;

/// Reads a plan written in YAML, which also accepts JSON, and refuses one that is incomplete before anything runs.
@Component
@RequiredArgsConstructor
public class Plans {

    private static final YAMLMapper YAML = YAMLMapper.builder().build();

    private final Validator validator;

    public Plan read(String source) {
        Plan plan;
        try {
            plan = YAML.readValue(source, Plan.class);
        } catch (JacksonException e) {
            throw new ApiException(new InvalidPlan(List.of(e.getOriginalMessage())));
        }
        var violations = validator.validate(plan);
        if (!violations.isEmpty())
            throw new ApiException(new InvalidPlan(violations.stream().map(Plans::describe).sorted().toList()));
        return plan;
    }

    private static String describe(ConstraintViolation<Plan> violation) {
        return violation.getPropertyPath() + " " + violation.getMessage();
    }

    record InvalidPlan(List<String> errors) implements Problem {

        @Override
        public HttpStatus status() {
            return HttpStatus.BAD_REQUEST;
        }

        @Override
        public String title() {
            return "Invalid plan";
        }

        @Override
        public String detail() {
            return "The plan has %d problem(s)".formatted(errors.size());
        }

        @Override
        public Map<String, Object> properties() {
            return Map.of("errors", errors);
        }
    }
}
