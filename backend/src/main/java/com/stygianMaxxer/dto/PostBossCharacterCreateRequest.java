package com.stygianMaxxer.dto;

import jakarta.validation.constraints.*;

public record PostBossCharacterCreateRequest(

        @NotNull
        Short charId,

        @NotNull
        @Min(1)
        @Max(4)
        Short slot,     // boxed so @Min/@Max actually fire

        boolean hasSig,

        @NotNull
        @Min(0)
        @Max(6)
        Short cons      // boxed so @Min/@Max actually fire
) {}
