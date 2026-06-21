package com.stygianMaxxer.dto;

/**
 * Lightweight per-boss summary used on post browse cards — just enough to
 * render a boss icon + name + that boss's clear time, without pulling in
 * the full character/weapon/artifact graph (see PostBossResponse for that).
 */
public record PostBossSummary(
        Short bossId,
        String bossSlug,
        String bossName,
        short clearTime   // seconds, 0-120
) {}
