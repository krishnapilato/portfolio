package com.personal.portfolio.mail;

import com.personal.portfolio.mail.MailPayloads.AttachmentView;
import com.personal.portfolio.mail.MailPayloads.BulkReceipt;
import com.personal.portfolio.mail.MailPayloads.BulkRequest;
import com.personal.portfolio.mail.MailPayloads.ComposeRequest;
import com.personal.portfolio.mail.MailPayloads.MailView;
import com.personal.portfolio.mail.MailPayloads.OutboxStats;
import com.personal.portfolio.mail.MailRepository.AttachmentMeta;
import com.personal.portfolio.platform.ApiException;
import com.personal.portfolio.platform.CorrelationFilter;
import com.personal.portfolio.platform.Pageables;
import com.personal.portfolio.platform.Problem.NotFound;
import com.personal.portfolio.platform.Tally;
import java.time.Clock;
import java.time.Instant;
import java.util.List;
import java.util.Map;
import java.util.Objects;
import java.util.Set;
import java.util.stream.Collectors;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.jspecify.annotations.Nullable;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Slf4j
@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
class MailService implements Notifier {

    private static final Set<String> SORTABLE = Set.of("createdAt", "scheduledAt", "status");

    private final MailRepository messages;
    private final NotificationRenderer renderer;
    private final Clock clock;

    @Override
    @Transactional
    public void notify(Notification notification) {
        var message = enqueue(renderer.render(notification), clock.instant());
        log.debug("Queued {} notification as mail {}", notification.getClass().getSimpleName(), message.getId());
    }

    @Transactional
    public MailView compose(ComposeRequest request, List<Attachment> attachments) {
        var envelope = new Envelope(request.to(), orEmpty(request.cc()), orEmpty(request.bcc()), request.replyTo(),
                request.subject(), request.body(), request.html(), attachments);
        var message = enqueue(envelope, sendAt(request.sendAt()));
        log.info("Queued mail {} for {} recipient(s) with {} attachment(s)", message.getId(),
                envelope.recipientCount(), attachments.size());
        return MailView.of(message, attachments.stream().map(AttachmentView::of).toList());
    }

    @Transactional
    public BulkReceipt bulk(BulkRequest request) {
        var sendAt = sendAt(request.sendAt());
        var requestId = requestId();
        var drafts = request.recipients().stream()
                .map(String::strip)
                .distinct()
                .map(recipient -> new Envelope(List.of(recipient), List.of(), List.of(), null, request.subject(),
                        request.body(), request.html(), List.of()))
                .map(envelope -> MailMessage.compose(envelope, sendAt, requestId))
                .toList();
        var ids = messages.saveAll(drafts).stream().map(MailMessage::getId).toList();
        log.info("Queued bulk mail as {} individual message(s)", ids.size());
        return new BulkReceipt(ids.size(), ids);
    }

    public Page<MailView> list(@Nullable MailStatus status, Pageable pageable) {
        var page = Pageables.restrict(pageable, SORTABLE);
        var found = status == null ? messages.findAll(page) : messages.findByStatus(status, page);
        var attachments = attachmentsOf(found.map(MailMessage::getId).getContent());
        return found.map(message -> MailView.of(message, attachments.getOrDefault(message.getId(), List.of())));
    }

    public MailView get(long id) {
        return view(find(id));
    }

    @Transactional
    public MailView retry(long id) {
        var message = find(id);
        message.retry(clock.instant());
        log.info("Mail {} rescheduled for delivery", id);
        return view(message);
    }

    @Transactional
    public MailView cancel(long id) {
        var message = find(id);
        message.cancel();
        log.info("Mail {} cancelled", id);
        return view(message);
    }

    public OutboxStats stats() {
        return new OutboxStats(Tally.zeroFilled(MailStatus.class, messages.tallyByStatus()),
                messages.oldestDue(MailStatus.PENDING, clock.instant()).orElse(null));
    }

    private MailView view(MailMessage message) {
        return MailView.of(message, attachmentsOf(List.of(message.getId())).getOrDefault(message.getId(), List.of()));
    }

    private Map<Long, List<AttachmentView>> attachmentsOf(List<Long> ids) {
        return ids.isEmpty() ? Map.of() : messages.attachmentMeta(ids).stream().collect(Collectors.groupingBy(
                AttachmentMeta::getMessageId, Collectors.mapping(AttachmentView::of, Collectors.toList())));
    }

    private MailMessage enqueue(Envelope envelope, Instant sendAt) {
        return messages.save(MailMessage.compose(envelope, sendAt, requestId()));
    }

    private static @Nullable String requestId() {
        return CorrelationFilter.current().orElse(null);
    }

    private MailMessage find(long id) {
        return messages.findById(id).orElseThrow(() -> new ApiException(new NotFound("mail", id)));
    }

    private Instant sendAt(@Nullable Instant requested) {
        return Objects.requireNonNullElseGet(requested, clock::instant);
    }

    private static List<String> orEmpty(@Nullable List<String> addresses) {
        return Objects.requireNonNullElse(addresses, List.of());
    }
}
