package com.personal.portfolio.mail;

import static java.lang.annotation.ElementType.ANNOTATION_TYPE;
import static java.lang.annotation.ElementType.FIELD;
import static java.lang.annotation.ElementType.METHOD;
import static java.lang.annotation.ElementType.PARAMETER;
import static java.lang.annotation.ElementType.TYPE_USE;
import static java.lang.annotation.RetentionPolicy.RUNTIME;

import jakarta.validation.Constraint;
import jakarta.validation.Payload;
import jakarta.validation.ReportAsSingleViolation;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.Size;
import java.lang.annotation.Documented;
import java.lang.annotation.Retention;
import java.lang.annotation.Target;

@Email(regexp = "[^\\s\",;]+")
@Size(max = 254)
@ReportAsSingleViolation
@Constraint(validatedBy = {})
@Documented
@Retention(RUNTIME)
@Target({FIELD, PARAMETER, METHOD, ANNOTATION_TYPE, TYPE_USE})
public @interface MailAddress {

    String message() default "must be a plain e-mail address";

    Class<?>[] groups() default {};

    Class<? extends Payload>[] payload() default {};
}
