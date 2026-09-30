package com.personal.portfolio.mail;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;

import java.util.ArrayList;
import java.util.List;
import org.junit.jupiter.api.Test;

class EnvelopeTests {

    @Test
    void countsVisibleAndBlindRecipients() {
        var envelope = new Envelope(List.of("a@x.io", "b@x.io"), List.of("c@x.io"),
                List.of("d@x.io", "e@x.io", "f@x.io"), null, "Subject", "Body", false, List.of());

        assertThat(envelope.recipientCount()).isEqualTo(6);
    }

    @Test
    void htmlEnvelopesAddressASingleRecipient() {
        var envelope = Envelope.html("a@x.io", "Subject", "<p>Body</p>");

        assertThat(envelope.recipientCount()).isEqualTo(1);
        assertThat(envelope.html()).isTrue();
        assertThat(envelope.cc()).isEmpty();
        assertThat(envelope.bcc()).isEmpty();
    }

    @Test
    void snapshotsItsListsSoLaterChangesCannotLeakIn() {
        var to = new ArrayList<>(List.of("a@x.io"));
        var envelope = new Envelope(to, List.of(), List.of(), null, "Subject", "Body", false, List.of());

        to.add("b@x.io");

        assertThat(envelope.to()).containsExactly("a@x.io");
        assertThatThrownBy(() -> envelope.to().add("c@x.io")).isInstanceOf(UnsupportedOperationException.class);
    }
}
