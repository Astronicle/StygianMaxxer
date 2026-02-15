package com.stygianMaxxer.service;

import com.stygianMaxxer.dto.CharacterResponse;

import java.util.List;

public interface CharacterService {

    List<CharacterResponse> getAllCharacters();

    CharacterResponse getBySlug(String slug);

    List<CharacterResponse> getByElement(short elementId);

    List<CharacterResponse> getByWeaponType(short weaponTypeId);
}
