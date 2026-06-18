package com.stygianMaxxer.dto;

public record PostBossCharacterResponse(

        Short charId,
        String charName,
        String charSlug,
        short slot,
        boolean hasSig,
        short cons
) {}