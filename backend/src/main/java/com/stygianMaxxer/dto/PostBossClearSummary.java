package com.stygianMaxxer.dto;

import java.math.BigDecimal;
import java.util.List;

/**
 * This-boss-only clear summary, attached to PostSummaryResponse when the
 * /api/posts request is filtered to a single bossId (i.e. the boss detail
 * page). Distinct from PostSummaryResponse.totalCost/totalClearTime, which
 * sum across every boss in the post — a post can clear multiple bosses, and
 * the boss detail page should only ever show numbers for the boss it's
 * scoped to, not the whole clear.
 */
public record PostBossClearSummary(
        short clearTime,                    // seconds, 0-120 — this boss only
        BigDecimal cost,                     // character + weapon cost — this boss only
        List<PostBossCharacterIcon> characters
) {}
