package com.personal.portfolio.security;

import static java.lang.annotation.ElementType.ANNOTATION_TYPE;
import static java.lang.annotation.ElementType.FIELD;
import static java.lang.annotation.ElementType.METHOD;
import static java.lang.annotation.ElementType.PARAMETER;
import static java.lang.annotation.ElementType.TYPE_USE;
import static java.lang.annotation.RetentionPolicy.RUNTIME;

import jakarta.validation.Constraint;
import jakarta.validation.ConstraintValidator;
import jakarta.validation.ConstraintValidatorContext;
import jakarta.validation.Payload;
import jakarta.validation.ReportAsSingleViolation;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;
import java.lang.annotation.Documented;
import java.lang.annotation.Retention;
import java.lang.annotation.Target;
import java.nio.charset.StandardCharsets;
import org.jspecify.annotations.Nullable;

@NotBlank
@Size(min = 10, max = StrongPassword.BCRYPT_LIMIT)
@Pattern(regexp = "^(?=.*[a-z])(?=.*[A-Z])(?=.*\\d).*$")
@ReportAsSingleViolation
@Constraint(validatedBy = StrongPassword.BcryptLimit.class)
@Documented
@Retention(RUNTIME)
@Target({FIELD, PARAMETER, METHOD, ANNOTATION_TYPE, TYPE_USE})
public @interface StrongPassword {

    int BCRYPT_LIMIT = 72;

    String message() default
            "must be 10-72 characters (at most 72 bytes) and contain upper-case, lower-case and a digit";

    Class<?>[] groups() default {};

    Class<? extends Payload>[] payload() default {};

    final class BcryptLimit implements ConstraintValidator<StrongPassword, String> {

        @Override
        public boolean isValid(@Nullable String value, ConstraintValidatorContext context) {
            return value == null || value.getBytes(StandardCharsets.UTF_8).length <= BCRYPT_LIMIT;
        }
    }
}
