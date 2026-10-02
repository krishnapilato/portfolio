package com.personal.portfolio.mail;

import com.personal.portfolio.platform.Tally;
import jakarta.persistence.LockModeType;
import jakarta.persistence.QueryHint;
import java.time.Instant;
import java.util.Collection;
import java.util.List;
import java.util.Optional;
import org.springframework.data.domain.Limit;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Lock;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.jpa.repository.QueryHints;

public interface MailRepository extends JpaRepository<MailMessage, Long> {

    // A lock timeout of -2 makes Hibernate add SKIP LOCKED: rows another instance is sending are passed over.
    @Lock(LockModeType.PESSIMISTIC_WRITE)
    @QueryHints(@QueryHint(name = "jakarta.persistence.lock.timeout", value = "-2"))
    @Query("select m from MailMessage m where m.status = :status and m.scheduledAt <= :now order by m.scheduledAt")
    List<MailMessage> lockDue(MailStatus status, Instant now, Limit limit);

    // Attachments go with their message through the ON DELETE CASCADE foreign key.
    @Modifying
    @Query("delete from MailMessage m where m.status in :statuses and m.updatedAt < :before")
    int deleteByStatusInAndUpdatedAtBefore(Collection<MailStatus> statuses, Instant before);

    Page<MailMessage> findByStatus(MailStatus status, Pageable pageable);

    @Query("select new com.personal.portfolio.platform.Tally(m.status, count(m)) from MailMessage m group by m.status")
    List<Tally<MailStatus>> tallyByStatus();

    @Query("select min(m.scheduledAt) from MailMessage m where m.status = :status and m.scheduledAt <= :now")
    Optional<Instant> oldestDue(MailStatus status, Instant now);

    @Query(nativeQuery = true, value = """
            select message_id, filename, content_type, octet_length(content) as size
            from mail_attachments where message_id in (:ids) order by message_id, sort_order
            """)
    List<AttachmentMeta> attachmentMeta(Collection<Long> ids);

    interface AttachmentMeta {

        long getMessageId();

        String getFilename();

        String getContentType();

        int getSize();
    }
}
