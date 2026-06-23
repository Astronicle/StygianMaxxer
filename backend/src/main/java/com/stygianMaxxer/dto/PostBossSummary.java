package com.stygianMaxxer.dto;

import java.math.BigDecimal;
import java.util.List;

/**
 * Lightweight per-boss summary used on post browse/stygian/boss cards —
 * renders boss icon + name + clear time + cost + character icons, without
 * pulling in the full weapon/artifact/refinement graph (PostBossResponse
 * has that). {@code characters} is populated by the service layer after a
 * batched query; it is never null (defaults to empty list).
 */
public record PostBossSummary(
        Short bossId,
        String bossSlug,
        String bossName,
        short clearTime,                    // seconds, 0-120
        BigDecimal cost,                     // auto-calculated team cost for this boss
        List<PostBossCharacterIcon> characters
) {}
