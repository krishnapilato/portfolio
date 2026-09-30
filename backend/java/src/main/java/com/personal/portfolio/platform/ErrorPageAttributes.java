package com.personal.portfolio.platform;

import java.util.Map;
import org.jspecify.annotations.Nullable;
import org.springframework.boot.web.error.ErrorAttributeOptions;
import org.springframework.boot.webmvc.error.DefaultErrorAttributes;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Component;
import org.springframework.web.context.request.RequestAttributes;
import org.springframework.web.context.request.WebRequest;

@Component
class ErrorPageAttributes extends DefaultErrorAttributes {

    @Override
    public Map<String, @Nullable Object> getErrorAttributes(WebRequest request, ErrorAttributeOptions options) {
        var attributes = super.getErrorAttributes(request, options);
        var status = attributes.get("status") instanceof Integer code ? code : HttpStatus.INTERNAL_SERVER_ERROR.value();
        if (status >= HttpStatus.INTERNAL_SERVER_ERROR.value()) {
            attributes.remove("message");
        }
        var copy = copyFor(status);
        attributes.put("requestId", requestId(request));
        attributes.put("title", copy.title());
        attributes.put("hint", copy.hint());
        return attributes;
    }

    private static @Nullable String requestId(WebRequest request) {
        return request.getAttribute(CorrelationFilter.ATTRIBUTE, RequestAttributes.SCOPE_REQUEST) instanceof String id
                ? id
                : null;
    }

    private static Copy copyFor(int status) {
        return switch (status) {
            case 401 -> new Copy("Authentication required",
                    "Sign in and send a valid bearer token to reach this resource.");
            case 403 -> new Copy("Access denied",
                    "Your account is not allowed to access this resource.");
            case 404 -> new Copy("Page not found",
                    "The page you are looking for does not exist or has moved.");
            case 405 -> new Copy("Method not allowed",
                    "This endpoint does not support the HTTP method that was used.");
            case 429 -> new Copy("Too many requests",
                    "Requests are arriving too quickly. Take a breath and try again in a moment.");
            case 500 -> new Copy("Something went wrong",
                    "An unexpected error occurred on our side. Quote the request id if you report it.");
            case 503 -> new Copy("Service unavailable",
                    "The service is temporarily unavailable. Please try again shortly.");
            default -> switch (HttpStatus.Series.resolve(status)) {
                case CLIENT_ERROR -> new Copy("Request not processed",
                        "The request could not be processed. Check it and try again.");
                case SERVER_ERROR -> new Copy("Server error",
                        "The server could not complete the request. Quote the request id if it keeps happening.");
                case null, default -> new Copy("Unexpected response",
                        "Something unexpected happened. Head back home and try again.");
            };
        };
    }

    private record Copy(String title, String hint) {}
}
