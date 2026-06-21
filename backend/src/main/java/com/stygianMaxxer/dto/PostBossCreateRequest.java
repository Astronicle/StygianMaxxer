package com.stygianMaxxer.dto;

import jakarta.validation.Valid;
import jakarta.validation.constraints.*;
import java.util.List;

public record PostBossCreateRequest(

        @NotNull
        Short bossId,

        @NotBlank
        String buildInfo,

        @NotNull
        @Min(0)
        @Max(120)
        Short clearTime,   // boxed so @Min/@Max actually fire; seconds taken to clear this boss

        @NotEmpty
        @Size(min = 1, max = 4)
        List<@Valid PostBossCharacterCreateRequest> characters
) {}