package com.personal.portfolio.mail;

import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.BDDMockito.given;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.verifyNoInteractions;

import com.personal.portfolio.mail.MailPayloads.ComposeRequest;
import java.io.IOException;
import java.io.UncheckedIOException;
import java.util.List;
import org.junit.jupiter.api.Test;
import org.springframework.http.MediaType;
import org.springframework.web.multipart.MultipartFile;

class MailControllerTests {

    private final MailService mail = mock(MailService.class);
    private final MailController controller = new MailController(mail);

    @Test
    void surfacesAnUnreadableUploadWithoutQueueingTheMessage() throws IOException {
        var failure = new IOException("Upload stream was reset");
        var upload = mock(MultipartFile.class);
        given(upload.getOriginalFilename()).willReturn("report.pdf");
        given(upload.getContentType()).willReturn(MediaType.APPLICATION_PDF_VALUE);
        given(upload.getBytes()).willThrow(failure);
        var request = new ComposeRequest(List.of("ada@example.test"), null, null, null, "Report", "Attached", false,
                null);

        assertThatThrownBy(() -> controller.composeWithAttachments(request, List.of(upload)))
                .isInstanceOf(UncheckedIOException.class)
                .hasCause(failure);
        verifyNoInteractions(mail);
    }
}
