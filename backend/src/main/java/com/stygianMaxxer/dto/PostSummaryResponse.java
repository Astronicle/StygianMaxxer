package com.stygianMaxxer.dto;

import com.stygianMaxxer.model.Difficulty;
import java.time.OffsetDateTime;

public record PostSummaryResponse(

        Integer postId,
        String title,
        String username,
        String stygianName,
        OffsetDateTime createdAt,
        Difficulty difficulty,

        Double averageRating,
        Long ratingCount
) {}