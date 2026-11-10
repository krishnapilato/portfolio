package com.example.mail.delivery;

import module java.base;

import com.example.mail.MailProperties;
import jakarta.mail.MessagingException;
import lombok.RequiredArgsConstructor;
import org.springframework.mail.MailException;
import org.springframework.mail.MailPreparationException;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.resilience.annotation.Retryable;
import org.springframework.stereotype.Component;

@Component
@RequiredArgsConstructor
class Courier {

    private final JavaMailSender sender;
    private final MailProperties properties;

    // A mail server that is briefly away gets a few more tries, further and further apart.
    @Retryable(includes = MailException.class, excludes = MailPreparationException.class,
        maxRetriesString = "${mail.delivery.max-retries:4}", delayString = "${mail.delivery.retry-delay:2s}", multiplier = 2)
    void deliver(Message message) {
        sender.send(mime -> {
            var helper = new MimeMessageHelper(mime, StandardCharsets.UTF_8.name());
            helper.setFrom(properties.from(), properties.sender());
            helper.setTo(message.getRecipient());
            helper.setSubject(message.getSubject());
            helper.setText(Objects.requireNonNull(message.getHtml()), true);
            if (message.getUnsubscribeUrl() != null) unsubscribable(helper, message.getUnsubscribeUrl());
        });
    }

    // RFC 8058: mail clients show an unsubscribe button that posts to the link without opening it.
    private static void unsubscribable(MimeMessageHelper helper, String url) throws MessagingException {
        helper.getMimeMessage().setHeader("List-Unsubscribe", "<" + url + ">");
        helper.getMimeMessage().setHeader("List-Unsubscribe-Post", "List-Unsubscribe=One-Click");
    }
}
