package org.example.error;

import jakarta.servlet.http.HttpServletRequest;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;

import java.time.Instant;
import java.util.Arrays;
import java.util.stream.Collectors;
import lombok.extern.slf4j.Slf4j;

@Slf4j
@RestControllerAdvice
public class GlobalExceptionHandler {

        @ExceptionHandler(ApiException.class)
        public ResponseEntity<ApiErrorResponse> handleApiException(
                        ApiException ex,
                        HttpServletRequest request) {
                // 🔥 FULL STACK TRACE IN LOGS
                log.error("API Exception occurred", ex);

                HttpStatus status = HttpStatus.valueOf(ex.getStatusCode());

                ApiErrorResponse response = ApiErrorResponse.builder()
                                .timestamp(Instant.now().toString())
                                .status(ex.getStatusCode())
                                .error(status.getReasonPhrase())
                                .message(ex.getMessage())
                                .path(request.getRequestURI())
                                .stackTrace(getStackTrace(ex)) // 👈 DEV ONLY
                                .build();

                return new ResponseEntity<>(response, status);
        }

        // fallback for any unhandled error
        @ExceptionHandler(Exception.class)
        public ResponseEntity<ApiErrorResponse> handleGenericException(
                        Exception ex,
                        HttpServletRequest request) {

                // 🔥 FULL STACK TRACE IN LOGS
                log.error("Unhandled exception occurred", ex);

                ApiErrorResponse response = ApiErrorResponse.builder()
                                .timestamp(Instant.now().toString())
                                .status(500)
                                .error("Internal Server Error")
                                .message("Something went wrong")
                                .path(request.getRequestURI())
                                .exception(ex.getClass().getName())
                                .stackTrace(getStackTrace(ex)) // 👈 DEV ONLY
                                .build();

                return ResponseEntity
                                .status(HttpStatus.INTERNAL_SERVER_ERROR)
                                .body(response);
        }

        // 🔹 Utility method to extract stack trace lines
        private static java.util.List<String> getStackTrace(Throwable ex) {
                return Arrays.stream(ex.getStackTrace())
                                .map(StackTraceElement::toString)
                                .collect(Collectors.toList());
        }
}
