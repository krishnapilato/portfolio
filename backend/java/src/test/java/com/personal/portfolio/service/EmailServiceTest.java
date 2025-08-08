package com.personal.portfolio.service;

import jakarta.mail.internet.MimeMessage;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.mockito.*;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;

import java.util.*;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

class EmailServiceTest {

    @Mock
    private JavaMailSender javaMailSender;

    @InjectMocks
    private EmailService emailService;

    @Captor
    private ArgumentCaptor<SimpleMailMessage> simpleMailCaptor;

    @Captor
    private ArgumentCaptor<MimeMessage> mimeMessageCaptor;

    @BeforeEach
    void setUp() {
        MockitoAnnotations.openMocks(this);
    }

    @Test
    void shouldSanitizeInput() {
        String dirty = "<script>alert('x')</script>";
        String cleaned = emailService.sanitizeInput(dirty);
        assertThat(cleaned).doesNotContain("<", ">", "'", "\"");
    }

    @Test
    void shouldSendPlainTextEmail() {
        doNothing().when(javaMailSender).send(any(SimpleMailMessage.class));

        emailService.sendEmail("test@example.com", "Subject", "Body", null, null, null, false);

        verify(javaMailSender).send(simpleMailCaptor.capture());
        SimpleMailMessage sent = simpleMailCaptor.getValue();

        assertThat(sent.getTo()).contains("test@example.com");
        assertThat(sent.getSubject()).isEqualTo("Subject");
    }

    @Test
    void shouldSendHtmlEmail() {
        MimeMessage mimeMessage = mock(MimeMessage.class);
        when(javaMailSender.createMimeMessage()).thenReturn(mimeMessage);

        emailService.sendEmail("test@example.com", "HTML Subject", "<b>Body</b>", null, null, null, true);

        verify(javaMailSender).send(any(MimeMessage.class));
    }

    @Test
    void shouldThrowOnInvalidEmail() {
        assertThatThrownBy(() ->
                emailService.sendEmail("invalid-email", "Subject", "Body", null, null, null, false))
                .isInstanceOf(IllegalArgumentException.class)
                .hasMessageContaining("Invalid email address");
    }

    @Test
    void shouldSendPasswordResetEmail() {
        doNothing().when(javaMailSender).send(any(SimpleMailMessage.class));
        emailService.sendPasswordResetEmail("user@example.com", "token123");
        verify(javaMailSender).send(any(SimpleMailMessage.class));
    }

    @Test
    void shouldResendConfirmationEmail() {
        doNothing().when(javaMailSender).send(any(SimpleMailMessage.class));
        emailService.resendConfirmationEmail("user@example.com");
        verify(javaMailSender).send(any(SimpleMailMessage.class));
    }

    @Test
    void shouldSendBulkEmail() {
        doNothing().when(javaMailSender).send(any(SimpleMailMessage.class));
        List<String> recipients = Arrays.asList("a@example.com", "b@example.com");
        emailService.sendBulkEmail(recipients, "Bulk Subject", "Bulk Body");
        verify(javaMailSender, times(2)).send(any(SimpleMailMessage.class));
    }

    @Test
    void shouldReturnUnknownStatus() {
        String status = emailService.getEmailStatus("nonexistent-id");
        assertThat(status).isEqualTo("UNKNOWN");
    }

    @Test
    void shouldValidateCorrectEmail() {
        assertThat(emailService.isValidEmail("valid@example.com")).isTrue();
        assertThat(emailService.isValidEmail("bad-email")).isFalse();
    }

    @Test
    void shouldGenerateSecurePasswordResetToken() {
        String token = emailService.generatePasswordResetToken();
        assertThat(token).isNotBlank().doesNotContain("+", "/");
    }

    @Test
    void shouldScheduleEmail() throws InterruptedException {
        doNothing().when(javaMailSender).send(any(SimpleMailMessage.class));
        Date future = new Date(System.currentTimeMillis() + 100); // 100 ms later

        emailService.scheduleEmail("test@example.com", "Scheduled", "Body", null, null, null, false, future);

        // Wait a bit (without really sleeping)
        Thread.sleep(200);

        // Verify eventually called
        verify(javaMailSender, atLeastOnce()).send(any(SimpleMailMessage.class));
    }

    @Test
    void shouldSendEmailWithAttachment() {
        MimeMessage mimeMessage = mock(MimeMessage.class);
        when(javaMailSender.createMimeMessage()).thenReturn(mimeMessage);

        Map<String, byte[]> attachments = new HashMap<>();
        attachments.put("file.txt", "Hello world".getBytes());

        emailService.sendEmailWithAttachment(
                "test@example.com", "Subject", "Body",
                null, null, null, false, attachments
        );

        verify(javaMailSender).send(any(MimeMessage.class));
    }
}