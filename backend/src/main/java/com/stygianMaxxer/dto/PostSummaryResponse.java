package com.stygianMaxxer.dto;

import java.time.OffsetDateTime;

public record PostSummaryResponse(

        Integer postId,
        String title,
        String username,
        String stygianName,
        OffsetDateTime createdAt,

        Double averageRating,
        Long ratingCount
) {}