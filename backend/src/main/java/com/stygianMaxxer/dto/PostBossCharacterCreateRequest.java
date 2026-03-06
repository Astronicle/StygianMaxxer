package com.stygianMaxxer.dto;

import jakarta.validation.constraints.*;

public record PostBossCharacterCreateRequest(

        @NotNull
        Short charId,

        @Min(1)
        @Max(4)
        short slot,

        boolean hasSig,

        @Min(0)
        @Max(6)
        short cons
) {}