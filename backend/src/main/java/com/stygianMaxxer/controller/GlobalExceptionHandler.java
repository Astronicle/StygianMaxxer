package com.stygianMaxxer.controller;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.validation.FieldError;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;

import java.time.OffsetDateTime;
import java.util.Map;
import java.util.NoSuchElementException;
import java.util.stream.Collectors;

@RestControllerAdvice
public class GlobalExceptionHandler {

    // ── 400 Bad Request ──────────────────────────────────────────────────────

    /**
     * Fired when @Valid fails on a @RequestBody.
     * Returns a map of field → error message so the client knows exactly what's wrong.
     */
    @ExceptionHandler(MethodArgumentNotValidException.class)
    public ResponseEntity<ErrorResponse> handleValidation(MethodArgumentNotValidException ex) {
        Map<String, String> fieldErrors = ex.getBindingResult().getFieldErrors()
                .stream()
                .collect(Collectors.toMap(
                        FieldError::getField,
                        fe -> fe.getDefaultMessage() != null ? fe.getDefaultMessage() : "Invalid value",
                        // keep first message if there are multiple errors on same field
                        (a, b) -> a
                ));

        return ResponseEntity
                .status(HttpStatus.BAD_REQUEST)
                .body(new ErrorResponse(
                        HttpStatus.BAD_REQUEST.value(),
                        "Validation failed",
                        fieldErrors.toString()
                ));
    }

    /**
     * Thrown by AuthService when username/email is already taken,
     * or by PostService when a rating value is out of range, etc.
     */
    @ExceptionHandler(IllegalArgumentException.class)
    public ResponseEntity<ErrorResponse> handleIllegalArgument(IllegalArgumentException ex) {
        return ResponseEntity
                .status(HttpStatus.BAD_REQUEST)
                .body(new ErrorResponse(
                        HttpStatus.BAD_REQUEST.value(),
                        "Bad request",
                        ex.getMessage()
                ));
    }

    // ── 404 Not Found ─────────────────────────────────────────────────────────

    /**
     * Thrown by orElseThrow() when an entity isn't found.
     * Services should throw this (or a custom NotFoundException) instead of RuntimeException.
     */
    @ExceptionHandler(NoSuchElementException.class)
    public ResponseEntity<ErrorResponse> handleNotFound(NoSuchElementException ex) {
        String message = ex.getMessage() != null ? ex.getMessage() : "Resource not found";
        return ResponseEntity
                .status(HttpStatus.NOT_FOUND)
                .body(new ErrorResponse(
                        HttpStatus.NOT_FOUND.value(),
                        "Not found",
                        message
                ));
    }

    // ── 409 Conflict ──────────────────────────────────────────────────────────

    /**
     * Use this for duplicate-resource situations (username taken, etc.)
     * Once you introduce a dedicated ConflictException, wire it here.
     */
    @ExceptionHandler(IllegalStateException.class)
    public ResponseEntity<ErrorResponse> handleConflict(IllegalStateException ex) {
        return ResponseEntity
                .status(HttpStatus.CONFLICT)
                .body(new ErrorResponse(
                        HttpStatus.CONFLICT.value(),
                        "Conflict",
                        ex.getMessage()
                ));
    }

    // ── 500 Fallback ─────────────────────────────────────────────────────────

    @ExceptionHandler(Exception.class)
    public ResponseEntity<ErrorResponse> handleGeneric(Exception ex) {
        // Log the real error server-side but don't expose internals to the client
        ex.printStackTrace(); // swap for a proper logger (e.g. log.error(..., ex))
        return ResponseEntity
                .status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(new ErrorResponse(
                        HttpStatus.INTERNAL_SERVER_ERROR.value(),
                        "Internal server error",
                        "An unexpected error occurred"
                ));
    }

    // ── Shared response shape ─────────────────────────────────────────────────

    public record ErrorResponse(
            int status,
            String error,
            String message,
            OffsetDateTime timestamp
    ) {
        // Convenience constructor — timestamp is always now
        public ErrorResponse(int status, String error, String message) {
            this(status, error, message, OffsetDateTime.now());
        }
    }
}
