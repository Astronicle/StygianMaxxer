package com.stygianMaxxer.dto;

import jakarta.validation.Valid;
import jakarta.validation.constraints.*;
import com.stygianMaxxer.model.BossTag;
import java.util.List;
import java.util.Set;

public record PostBossCreateRequest(

        @NotNull
        Short bossId,

        @NotBlank
        String buildInfo,

        @NotNull
        @Min(0)
        @Max(120)
        Short clearTime,   // boxed so @Min/@Max actually fire; seconds taken to clear this boss

        // Boss-specific tags — Ping Dependent, tool/execution tags, Cheese, Over Level.
        // Null/omitted is treated as no tags.
        Set<BossTag> tags,

        @NotEmpty
        @Size(min = 1, max = 4)
        List<@Valid PostBossCharacterCreateRequest> characters
) {}
