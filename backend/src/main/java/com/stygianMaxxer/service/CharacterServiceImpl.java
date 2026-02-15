package com.stygianMaxxer.service;

import com.stygianMaxxer.dto.CharacterResponse;
import com.stygianMaxxer.dto.LookupRef;
import com.stygianMaxxer.model.Character;
import com.stygianMaxxer.repository.CharacterRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class CharacterServiceImpl implements CharacterService {

    private final CharacterRepository characterRepository;

    @Override
    public List<CharacterResponse> getAllCharacters() {
        return characterRepository.findAll(Sort.by("id"))
                .stream()
                .map(this::toDto)
                .toList();
    }

    @Override
    public CharacterResponse getBySlug(String slug) {
        Character character = characterRepository.findBySlug(slug)
                .orElseThrow(() -> new RuntimeException("Character not found"));

        return toDto(character);
    }

    @Override
    public List<CharacterResponse> getByElement(short elementId) {
        return characterRepository.findByElement_Id(elementId)
                .stream()
                .map(this::toDto)
                .toList();
    }

    @Override
    public List<CharacterResponse> getByWeaponType(short weaponTypeId) {
        return characterRepository.findByWeaponType_Id(weaponTypeId)
                .stream()
                .map(this::toDto)
                .toList();
    }

    private CharacterResponse toDto(Character character) {
        return new CharacterResponse(
                character.getId(),
                character.getSlug(),
                character.getName(),
                character.getRarity(),
                new LookupRef(
                        character.getElement().getId(),
                        character.getElement().getSlug(),
                        character.getElement().getName()
                ),
                new LookupRef(
                        character.getWeaponType().getId(),
                        character.getWeaponType().getSlug(),
                        character.getWeaponType().getName()
                )
        );
    }
}
