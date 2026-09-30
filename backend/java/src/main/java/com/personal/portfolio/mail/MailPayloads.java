package com.personal.portfolio.mail;

import com.personal.portfolio.mail.MailRepository.AttachmentMeta;
import jakarta.validation.constraints.Future;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import java.time.Instant;
import java.util.List;
import java.util.Map;
import org.jspecify.annotations.Nullable;

public final class MailPayloads {

    private MailPayloads() {}

    public record ComposeRequest(
            @NotEmpty @Size(max = 10) List<@NotNull @MailAddress String> to,
            @Nullable @Size(max = 10) List<@NotNull @MailAddress String> cc,
            @Nullable @Size(max = 10) List<@NotNull @MailAddress String> bcc,
            @Nullable @MailAddress String replyTo,
            @NotBlank @Size(max = 200) String subject,
            @NotBlank @Size(max = 100000) String body,
            boolean html,
            @Nullable @Future Instant sendAt) {}

    public record BulkRequest(
            @NotEmpty @Size(max = 500) List<@NotNull @MailAddress String> recipients,
            @NotBlank @Size(max = 200) String subject,
            @NotBlank @Size(max = 100000) String body,
            boolean html,
            @Nullable @Future Instant sendAt) {}

    public record MailView(
            long id,
            List<String> to,
            List<String> cc,
            List<String> bcc,
            @Nullable String replyTo,
            String subject,
            boolean html,
            MailStatus status,
            int attempts,
            Instant scheduledAt,
            @Nullable Instant sentAt,
            @Nullable String lastError,
            List<AttachmentView> attachments,
            Instant createdAt) {

        public static MailView of(MailMessage message, List<AttachmentView> attachments) {
            return new MailView(message.getId(), message.getRecipients(), message.getCc(), message.getBcc(),
                    message.getReplyTo(), message.getSubject(), message.isHtml(), message.getStatus(),
                    message.getAttempts(), message.getScheduledAt(), message.getSentAt(), message.getLastError(),
                    attachments, message.getCreatedAt());
        }
    }

    public record AttachmentView(String filename, String contentType, int size) {

        public static AttachmentView of(Attachment attachment) {
            return new AttachmentView(attachment.filename(), attachment.contentType(), attachment.size());
        }

        public static AttachmentView of(AttachmentMeta stored) {
            return new AttachmentView(stored.getFilename(), stored.getContentType(), stored.getSize());
        }
    }

    public record BulkReceipt(int queued, List<Long> ids) {}

    public record OutboxStats(Map<MailStatus, Long> byStatus, @Nullable Instant oldestDue) {}
}
