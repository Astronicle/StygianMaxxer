package com.stygianMaxxer.dto;

public record AuthResponse(
        String accessToken,
        String tokenType
) {}
