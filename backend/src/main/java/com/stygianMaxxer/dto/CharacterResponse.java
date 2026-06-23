package com.stygianMaxxer.dto;

public record CharacterResponse(
        short id,
        String slug,
        String name,
        short rarity,
        boolean isLimited,
        LookupRef element,
        LookupRef weaponType
) {}