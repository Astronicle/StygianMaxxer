package com.stygianMaxxer.dto;

import jakarta.validation.Valid;
import jakarta.validation.constraints.*;
import com.stygianMaxxer.model.Difficulty;
import com.stygianMaxxer.model.PostTag;
import java.util.List;
import java.util.Set;

public record PostCreateRequest(

        @NotNull
        Short stygianId,

        @NotBlank
        String title,

        @NotBlank
        String description,

        @NotBlank
        String videoLink,

        @NotNull
        Difficulty difficulty,

        // Post-wide tags — Mine/Not Mine, No Builds, FPS tags, Ping tags.
        // Null/omitted is treated as no tags.
        Set<PostTag> tags,

        @NotEmpty
        @Size(min = 1, max = 3)
        List<@Valid PostBossCreateRequest> bosses
) {}
