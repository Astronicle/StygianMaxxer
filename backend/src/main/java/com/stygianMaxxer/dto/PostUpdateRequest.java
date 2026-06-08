package com.stygianMaxxer.dto;

import jakarta.validation.Valid;
import jakarta.validation.constraints.*;
import java.util.List;

/**
 * Request body for PUT /api/posts/{postId}.
 *
 * All fields are optional (null = keep existing value).
 * If {@code bosses} is provided it must be a valid non-empty list
 * of 1–3 entries; when present it fully replaces the post's boss list
 * (orphanRemoval on Post.bosses takes care of the old rows).
 */
public record PostUpdateRequest(

        /** Leave null to keep the existing title. */
        @Size(min = 1, max = 255)
        String title,

        /** Leave null to keep the existing description. */
        String description,

        /** Leave null to keep the existing video link. */
        String videoLink,

        /**
         * Leave null to keep the existing bosses unchanged.
         * If provided, must contain 1–3 entries and fully replaces
         * the current boss list.
         */
        @Size(min = 1, max = 3)
        List<@Valid PostBossCreateRequest> bosses
) {}
