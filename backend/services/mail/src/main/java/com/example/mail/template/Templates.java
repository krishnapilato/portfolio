package com.example.mail.template;

import module java.base;

import com.example.core.problem.ApiException;
import com.example.core.problem.NotFound;
import com.example.core.problem.Problem;
import com.samskivert.mustache.Mustache;
import com.samskivert.mustache.MustacheException;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

/// Templates are Mustache: logic-less, so a template stored through the API can fill in values but never run code.
/// Values are HTML-escaped in the body; the subject is plain text on one line.
@Service
@RequiredArgsConstructor
public class Templates {

    private static final Mustache.Compiler BODY = Mustache.compiler().escapeHTML(true).defaultValue("");
    private static final Mustache.Compiler SUBJECT = Mustache.compiler().escapeHTML(false).defaultValue("");
    private static final Pattern LINE_BREAKS = Pattern.compile("\\R+");

    private final TemplateRepository templates;
    private final Clock clock;

    public Rendered render(String name, Map<String, ?> values) {
        var template = find(name);
        var subject = LINE_BREAKS.matcher(SUBJECT.compile(template.getSubject()).execute(values)).replaceAll(" ").strip();
        return new Rendered(subject, BODY.compile(template.getBody()).execute(values));
    }

    @Transactional(readOnly = true)
    public List<MessageTemplate> all() {
        return templates.findAllByOrderByName();
    }

    @Transactional(readOnly = true)
    public MessageTemplate find(String name) {
        return templates.findByName(name).orElseThrow(() -> new ApiException(new NotFound("Template", name)));
    }

    @Transactional
    public MessageTemplate save(String name, String subject, String body) {
        compile(subject);
        compile(body);
        var now = clock.instant();
        var template = templates.findByName(name).orElseGet(() -> new MessageTemplate(name, subject, body, now));
        template.revise(subject, body, now);
        return templates.save(template);
    }

    @Transactional
    public void delete(String name) {
        templates.delete(find(name));
    }

    private static void compile(String source) {
        try {
            BODY.compile(source);
        } catch (MustacheException e) {
            throw new ApiException(new InvalidTemplate(e.getMessage()));
        }
    }

    public record Rendered(String subject, String html) {}

    record InvalidTemplate(String reason) implements Problem {

        @Override
        public HttpStatus status() {
            return HttpStatus.BAD_REQUEST;
        }

        @Override
        public String title() {
            return "Invalid template";
        }

        @Override
        public String detail() {
            return reason;
        }
    }
}
