package com.stygianMaxxer.dto;

import jakarta.validation.constraints.*;

public record PostBossCharacterCreateRequest(

        @NotNull
        Short charId,

        @NotNull
        Short weaponId,

        @NotNull
        Short artifactSetId,

        @NotNull
        @Min(1)
        @Max(5)
        Short refinement,   // boxed so @Min/@Max actually fire; weapon refinement level R1-R5

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
