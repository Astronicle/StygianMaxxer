package com.stygianMaxxer.dto;

public record WeaponResponse(
        short id,
        String slug,
        String name,
        short rarity,
        LookupRef weaponType
) {}
