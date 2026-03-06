package com.stygianMaxxer.dto;

import java.time.OffsetDateTime;
import java.util.List;

public record PostResponse(

        Integer postId,
        String title,
        String description,
        String videoLink,
        OffsetDateTime createdAt,
        OffsetDateTime updatedAt,

        AccountSummary account,
        StygianSummary stygian,

        List<PostBossResponse> bosses
) {}