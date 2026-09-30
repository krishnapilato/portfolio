package com.personal.portfolio.platform;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.BDDMockito.given;
import static org.mockito.Mockito.mock;

import jakarta.servlet.RequestDispatcher;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.params.ParameterizedTest;
import org.junit.jupiter.params.provider.CsvSource;
import org.springframework.boot.web.error.ErrorAttributeOptions;
import org.springframework.boot.web.error.ErrorAttributeOptions.Include;
import org.springframework.mock.web.MockHttpServletRequest;
import org.springframework.web.context.request.RequestAttributes;
import org.springframework.web.context.request.ServletWebRequest;
import org.springframework.web.context.request.WebRequest;

class ErrorPageAttributesTests {

    private final ErrorPageAttributes attributes = new ErrorPageAttributes();

    @ParameterizedTest(name = "{0} -> {1}")
    @CsvSource(delimiter = '|', textBlock = """
            401 | Authentication required | Sign in and send a valid bearer token to reach this resource.
            403 | Access denied           | Your account is not allowed to access this resource.
            404 | Page not found          | The page you are looking for does not exist or has moved.
            405 | Method not allowed      | This endpoint does not support the HTTP method that was used.
            429 | Too many requests       | Requests are arriving too quickly. Take a breath and try again in a moment.
            500 | Something went wrong    | An unexpected error occurred on our side. Quote the request id if you report it.
            503 | Service unavailable     | The service is temporarily unavailable. Please try again shortly.
            400 | Request not processed   | The request could not be processed. Check it and try again.
            418 | Request not processed   | The request could not be processed. Check it and try again.
            502 | Server error            | The server could not complete the request. Quote the request id if it keeps happening.
            504 | Server error            | The server could not complete the request. Quote the request id if it keeps happening.
            302 | Unexpected response     | Something unexpected happened. Head back home and try again.
            999 | Unexpected response     | Something unexpected happened. Head back home and try again.
            """)
    void describesEveryStatusWithATitleAndAHint(int status, String title, String hint) {
        var request = new MockHttpServletRequest("GET", "/missing-page");
        request.setAttribute(RequestDispatcher.ERROR_STATUS_CODE, status);

        var model = attributes.getErrorAttributes(new ServletWebRequest(request), ErrorAttributeOptions.defaults());

        assertThat(model)
                .containsEntry("status", status)
                .containsEntry("title", title)
                .containsEntry("hint", hint);
    }

    @Test
    void fallsBackToTheUnexpectedCopyWhenNoStatusWasRecorded() {
        var model = attributes.getErrorAttributes(new ServletWebRequest(new MockHttpServletRequest()),
                ErrorAttributeOptions.defaults());

        assertThat(model)
                .containsEntry("status", 999)
                .containsEntry("title", "Unexpected response");
    }

    @Test
    void describesAServerFailureWhenTheStatusIsExcluded() {
        var request = new MockHttpServletRequest();
        request.setAttribute(RequestDispatcher.ERROR_STATUS_CODE, 404);

        var model = attributes.getErrorAttributes(new ServletWebRequest(request),
                ErrorAttributeOptions.defaults().excluding(Include.STATUS));

        assertThat(model)
                .doesNotContainKey("status")
                .containsEntry("title", "Something went wrong");
    }

    @Test
    void exposesTheRequestIdRecordedByTheCorrelationFilter() {
        var request = new MockHttpServletRequest();
        request.setAttribute(CorrelationFilter.ATTRIBUTE, "from-attribute-01");

        var model = attributes.getErrorAttributes(new ServletWebRequest(request), ErrorAttributeOptions.defaults());

        assertThat(model).containsEntry("requestId", "from-attribute-01");
    }

    @ParameterizedTest(name = "{0} exposes the message: {1}")
    @CsvSource({"404, true", "499, true", "500, false", "503, false"})
    void hidesExceptionMessagesOfServerErrors(int status, boolean exposed) {
        var request = new MockHttpServletRequest();
        request.setAttribute(RequestDispatcher.ERROR_STATUS_CODE, status);
        request.setAttribute(RequestDispatcher.ERROR_EXCEPTION, new IllegalStateException("Communications link failure"));

        var model = attributes.getErrorAttributes(new ServletWebRequest(request),
                ErrorAttributeOptions.defaults().including(Include.MESSAGE));

        assertThat(model.containsKey("message")).isEqualTo(exposed);
    }

    @Test
    void leavesTheRequestIdEmptyForRequestsOutsideTheServletStack() {
        var request = mock(WebRequest.class);
        given(request.getAttribute(RequestDispatcher.ERROR_STATUS_CODE, RequestAttributes.SCOPE_REQUEST))
                .willReturn(404);

        var model = attributes.getErrorAttributes(request, ErrorAttributeOptions.defaults());

        assertThat(model)
                .containsEntry("requestId", null)
                .containsEntry("status", 404)
                .containsEntry("title", "Page not found");
    }

    @Test
    void leavesTheRequestIdEmptyWhenNothingCorrelatesTheRequest() {
        var model = attributes.getErrorAttributes(new ServletWebRequest(new MockHttpServletRequest()),
                ErrorAttributeOptions.defaults());

        assertThat(model).containsEntry("requestId", null);
    }
}
