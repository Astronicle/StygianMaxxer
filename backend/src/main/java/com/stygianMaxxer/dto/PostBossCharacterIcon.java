package com.stygianMaxxer.dto;

/**
 * Minimal character reference — just enough to render an icon + name.
 * Used where weapon/artifact/refinement detail isn't needed (e.g. the boss
 * detail page's "characters used" list). See PostBossCharacterResponse for
 * the full per-slot breakdown (weapon, artifact set, refinement, cost).
 */
public record PostBossCharacterIcon(
        Short charId,
        String charSlug,
        String charName
) {}
