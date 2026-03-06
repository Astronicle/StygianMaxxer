package com.stygianMaxxer.dto;

public record PostBossCharacterResponse(

        Short charId,
        String charName,
        short slot,
        boolean hasSig,
        short cons
) {}