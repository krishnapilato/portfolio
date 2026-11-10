package com.example.core.web;

import module java.base;
import static org.assertj.core.api.Assertions.assertThat;

import com.example.core.support.IntegrationTest;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.params.ParameterizedTest;
import org.junit.jupiter.params.provider.ValueSource;
import org.springframework.mock.web.MockFilterChain;
import org.springframework.mock.web.MockHttpServletRequest;
import org.springframework.mock.web.MockHttpServletResponse;

class RequestIdFilterTests extends IntegrationTest {

    private static final Instant NOW = Instant.parse("2026-11-10T08:15:30.123Z");

    private final RequestIdFilter filter = new RequestIdFilter(Clock.fixed(NOW, ZoneOffset.UTC));

    @ParameterizedTest
    @ValueSource(strings = {"abcdefgh", "client-trace_0001.v2", "0123456789012345678901234567890123456789012345678901234567890123"})
    void echoesAPlainInboundId(String inbound) {
        assertThat(mvc.get().uri("/").header(RequestIdFilter.HEADER, inbound)).hasHeader(RequestIdFilter.HEADER, inbound);
    }

    @ParameterizedTest
    @ValueSource(strings = {"short", "has space inside", "line\nbreak-1234", "01234567890123456789012345678901234567890123456789012345678901234"})
    void replacesAnUnsafeInboundIdWithATimeOrderedOne(String inbound) throws Exception {
        var request = new MockHttpServletRequest();
        request.addHeader(RequestIdFilter.HEADER, inbound);
        var response = new MockHttpServletResponse();

        filter.doFilter(request, response, new MockFilterChain());

        var id = UUID.fromString(response.getHeader(RequestIdFilter.HEADER));
        assertThat(id.version()).isEqualTo(7);
        assertThat(id.getMostSignificantBits() >>> 16).isEqualTo(NOW.toEpochMilli());
    }

    @Test
    void exposesTheIdOnlyWhileTheRequestRuns() throws Exception {
        var seen = new AtomicReference<Optional<String>>();
        var request = new MockHttpServletRequest();
        request.addHeader(RequestIdFilter.HEADER, "inside-request-1");

        filter.doFilter(request, new MockHttpServletResponse(), (_, _) -> seen.set(RequestIdFilter.current()));

        assertThat(seen.get()).contains("inside-request-1");
        assertThat(RequestIdFilter.current()).isEmpty();
    }
}
