package com.stygianMaxxer.dto;

import jakarta.validation.Valid;
import jakarta.validation.constraints.*;
import java.util.List;

public record PostCreateRequest(

        @NotNull
        Integer accountId,

        @NotNull
        Short stygianId,

        @NotBlank
        String title,

        @NotBlank
        String description,

        @NotBlank
        String videoLink,

        @NotEmpty
        @Size(min = 1, max = 3)
        List<@Valid PostBossCreateRequest> bosses
) {}