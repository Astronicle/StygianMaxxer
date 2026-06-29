package com.stygianMaxxer.dto;

public record AccountSummaryResponse(

        Integer accountId,
        String username,
        Short avatarCharId,     // null if no avatar set
        String avatarCharName,  // null if no avatar set
        String avatarCharSlug   // null if no avatar set — use this (not the name) to build icon URLs

) {}
