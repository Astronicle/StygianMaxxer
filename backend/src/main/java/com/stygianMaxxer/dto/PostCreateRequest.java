package com.stygianMaxxer.dto;

import jakarta.validation.Valid;
import jakarta.validation.constraints.*;
import com.stygianMaxxer.model.Difficulty;
import java.util.List;

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

        @NotEmpty
        @Size(min = 1, max = 3)
        List<@Valid PostBossCreateRequest> bosses
) {}
