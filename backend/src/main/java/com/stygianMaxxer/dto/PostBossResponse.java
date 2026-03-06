package com.stygianMaxxer.dto;

import java.util.List;

public record PostBossResponse(

        Short bossId,
        String bossName,
        String buildInfo,

        List<PostBossCharacterResponse> characters
) {}