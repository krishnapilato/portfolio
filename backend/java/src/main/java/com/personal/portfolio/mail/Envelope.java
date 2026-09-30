package com.personal.portfolio.mail;

import java.util.List;
import org.jspecify.annotations.Nullable;

public record Envelope(
        List<String> to,
        List<String> cc,
        List<String> bcc,
        @Nullable String replyTo,
        String subject,
        String body,
        boolean html,
        List<Attachment> attachments) {

    public Envelope {
        to = List.copyOf(to);
        cc = List.copyOf(cc);
        bcc = List.copyOf(bcc);
        attachments = List.copyOf(attachments);
    }

    public int recipientCount() {
        return to.size() + cc.size() + bcc.size();
    }

    public static Envelope html(String to, String subject, String body) {
        return new Envelope(List.of(to), List.of(), List.of(), null, subject, body, true, List.of());
    }
}
