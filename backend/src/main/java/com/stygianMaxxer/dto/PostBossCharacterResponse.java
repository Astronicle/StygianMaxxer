package com.stygianMaxxer.dto;

public record PostBossCharacterResponse(

        Short charId,
        String charName,
        String charSlug,
        Short weaponId,
        String weaponName,
        String weaponSlug,
        short weaponRarity,
        String weaponTypeSlug,
        Short artifactSetId,
        String artifactSetName,
        String artifactSetSlug,
        short slot,
        boolean hasSig,
        short cons
) {}