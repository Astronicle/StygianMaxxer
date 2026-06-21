package com.stygianMaxxer.dto;

import java.util.List;

public record PostBossResponse(

        Short bossId,
        String bossSlug,   // added — useful for client-side routing
        String bossName,
        String buildInfo,
        short clearTime,   // seconds, 0-120

        List<PostBossCharacterResponse> characters
) {}
