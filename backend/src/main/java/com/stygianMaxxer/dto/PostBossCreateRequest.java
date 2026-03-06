package com.stygianMaxxer.dto;

import jakarta.validation.Valid;
import jakarta.validation.constraints.*;
import java.util.List;

public record PostBossCreateRequest(

        @NotNull
        Short bossId,

        @NotBlank
        String buildInfo,

        @NotEmpty
        @Size(min = 1, max = 4)
        List<@Valid PostBossCharacterCreateRequest> characters
) {}