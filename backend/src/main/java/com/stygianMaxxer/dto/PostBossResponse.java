package com.stygianMaxxer.dto;

import com.stygianMaxxer.model.BossTag;
import java.math.BigDecimal;
import java.util.List;
import java.util.Set;

public record PostBossResponse(

        Short bossId,
        String bossSlug,   // added — useful for client-side routing
        String bossName,
        String buildInfo,
        short clearTime,   // seconds, 0-120
        BigDecimal cost,   // auto-calculated team cost — see CostCalculator
        Set<BossTag> tags, // boss-specific tags — Ping Dependent, tool/execution tags, Cheese, Over Level

        List<PostBossCharacterResponse> characters
) {}
