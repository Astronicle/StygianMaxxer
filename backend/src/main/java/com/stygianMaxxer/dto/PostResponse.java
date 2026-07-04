package com.stygianMaxxer.dto;

import com.stygianMaxxer.model.Difficulty;
import com.stygianMaxxer.model.PostTag;
import java.time.OffsetDateTime;
import java.util.List;
import java.util.Set;

public record PostResponse(

        Integer postId,
        String title,
        String description,
        String videoLink,
        Difficulty difficulty,
        Set<PostTag> tags,   // post-wide tags — Mine/Not Mine, No Builds, FPS tags, Ping tags
        OffsetDateTime createdAt,
        OffsetDateTime updatedAt,

        AccountSummary account,
        StygianSummary stygian,

        List<PostBossResponse> bosses
) {}
