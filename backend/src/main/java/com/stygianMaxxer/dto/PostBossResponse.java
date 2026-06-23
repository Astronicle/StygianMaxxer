package com.stygianMaxxer.dto;

import java.math.BigDecimal;
import java.util.List;

public record PostBossResponse(

        Short bossId,
        String bossSlug,   // added — useful for client-side routing
        String bossName,
        String buildInfo,
        short clearTime,   // seconds, 0-120
        BigDecimal cost,   // auto-calculated team cost — see CostCalculator

        List<PostBossCharacterResponse> characters
) {}
