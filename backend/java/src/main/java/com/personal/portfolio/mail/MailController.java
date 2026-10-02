package com.personal.portfolio.mail;

import static java.util.function.Predicate.not;

import com.personal.portfolio.mail.MailPayloads.BulkReceipt;
import com.personal.portfolio.mail.MailPayloads.BulkRequest;
import com.personal.portfolio.mail.MailPayloads.ComposeRequest;
import com.personal.portfolio.mail.MailPayloads.MailView;
import com.personal.portfolio.mail.MailPayloads.OutboxStats;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import jakarta.validation.constraints.Size;
import java.io.IOException;
import java.io.UncheckedIOException;
import java.util.List;
import java.util.Objects;
import java.util.regex.Pattern;
import lombok.RequiredArgsConstructor;
import org.jspecify.annotations.Nullable;
import org.springdoc.core.annotations.ParameterObject;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RequestPart;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.web.servlet.support.ServletUriComponentsBuilder;

@RestController
@Tag(name = "Mail", description = "Transactional outbox: compose, bulk send, inspect, retry and cancel")
@RequestMapping(path = "/api/v{version}/mail", version = "1")
@RequiredArgsConstructor
class MailController {

    private static final int MAX_ATTACHMENTS = 5;
    private static final int MAX_FILENAME = 255;
    private static final String UNNAMED_ATTACHMENT = "attachment";
    // Upload names and types come from the client and end up in MIME headers: keep only a plain base name
    // (no directories, no control characters) and a simple type/subtype.
    private static final Pattern UNSAFE_FILENAME = Pattern.compile("(?s)^.*[/\\\\]|\\p{Cntrl}");
    private static final Pattern MEDIA_TYPE = Pattern.compile("[\\w.+-]{1,63}/[\\w.+-]{1,63}");

    private final MailService mail;

    @PostMapping(path = "/messages", consumes = MediaType.APPLICATION_JSON_VALUE)
    ResponseEntity<MailView> compose(@Valid @RequestBody ComposeRequest request) {
        return accepted(mail.compose(request, List.of()));
    }

    @PostMapping(path = "/messages", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    ResponseEntity<MailView> composeWithAttachments(
            @Valid @RequestPart("message") ComposeRequest request,
            @Size(max = MAX_ATTACHMENTS) @RequestPart(name = "attachments", required = false)
                    @Nullable List<MultipartFile> attachments) {
        var files = Objects.requireNonNullElse(attachments, List.<MultipartFile>of()).stream()
                .filter(not(MultipartFile::isEmpty))
                .map(MailController::attachment)
                .toList();
        return accepted(mail.compose(request, files));
    }

    @PostMapping("/messages/bulk")
    ResponseEntity<BulkReceipt> bulk(@Valid @RequestBody BulkRequest request) {
        return ResponseEntity.accepted().body(mail.bulk(request));
    }

    @GetMapping("/messages")
    Page<MailView> list(
            @RequestParam(required = false) @Nullable MailStatus status,
            @ParameterObject @PageableDefault(size = 20, sort = "createdAt", direction = Sort.Direction.DESC)
                    Pageable pageable) {
        return mail.list(status, pageable);
    }

    @GetMapping("/messages/{id}")
    MailView get(@PathVariable long id) {
        return mail.get(id);
    }

    @PostMapping("/messages/{id}/retry")
    MailView retry(@PathVariable long id) {
        return mail.retry(id);
    }

    @PostMapping("/messages/{id}/cancel")
    MailView cancel(@PathVariable long id) {
        return mail.cancel(id);
    }

    @GetMapping("/stats")
    OutboxStats stats() {
        return mail.stats();
    }

    private static ResponseEntity<MailView> accepted(MailView view) {
        var location = ServletUriComponentsBuilder.fromCurrentRequestUri()
                .path("/{id}")
                .buildAndExpand(view.id())
                .toUri();
        return ResponseEntity.accepted().location(location).body(view);
    }

    private static Attachment attachment(MultipartFile file) {
        try {
            return new Attachment(filename(file), contentType(file), file.getBytes());
        } catch (IOException e) {
            throw new UncheckedIOException(e);
        }
    }

    private static String filename(MultipartFile file) {
        var original = Objects.requireNonNullElse(file.getOriginalFilename(), "");
        var name = UNSAFE_FILENAME.matcher(original).replaceAll("").strip();
        return name.isEmpty() ? UNNAMED_ATTACHMENT : name.substring(0, Math.min(name.length(), MAX_FILENAME));
    }

    private static String contentType(MultipartFile file) {
        var type = Objects.requireNonNullElse(file.getContentType(), "");
        return MEDIA_TYPE.matcher(type).matches() ? type : MediaType.APPLICATION_OCTET_STREAM_VALUE;
    }
}
