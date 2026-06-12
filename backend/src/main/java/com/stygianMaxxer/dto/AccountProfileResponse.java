package com.stygianMaxxer.dto;

import java.time.OffsetDateTime;

public record AccountProfileResponse(

        Integer accountId,
        String username,
        String email,           // null when viewing another user's public profile
        Short avatarCharId,     // null if no avatar set
        String avatarCharName,  // null if no avatar set
        OffsetDateTime creationDate

) {}
