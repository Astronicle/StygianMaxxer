package com.stygianMaxxer.dto;

import java.math.BigDecimal;

public record PostBossCharacterResponse(

        Short charId,
        String charName,
        String charSlug,
        short charRarity,
        boolean charLimited,
        BigDecimal characterCost,   // this slot's character-only cost contribution
        Short weaponId,
        String weaponName,
        String weaponSlug,
        short weaponRarity,
        String weaponTypeSlug,
        boolean weaponLimited,
        BigDecimal weaponCost,      // this slot's weapon-only cost contribution
        short refinement,
        Short artifactSetId,
        String artifactSetName,
        String artifactSetSlug,
        short slot,
        boolean hasSig,
        short cons
) {}