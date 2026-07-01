package com.stygianMaxxer.dto;

/**
 * Character reference used on summary/browse cards (boss detail, stygian
 * detail, post browse) — icon + name plus the weapon/refinement/cons detail
 * needed to render those cards without pulling in the full per-slot cost
 * breakdown. See PostBossCharacterResponse for the full detail-page version
 * (adds per-slot cost contributions, artifact set, weapon type slug, etc.).
 */
public record PostBossCharacterIcon(
        Short charId,
        String charSlug,
        String charName,
        short cons,
        Short weaponId,
        String weaponSlug,
        String weaponName,
        String weaponTypeSlug,
        short weaponRarity,
        short refinement,
        boolean hasSig
) {}
