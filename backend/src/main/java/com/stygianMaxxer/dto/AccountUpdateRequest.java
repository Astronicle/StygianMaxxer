package com.stygianMaxxer.dto;

public record AccountUpdateRequest(

        // All fields optional — null means "don't change this field"

        String username,
        String email,
        Short avatarCharId   // send null to remove avatar

) {}
