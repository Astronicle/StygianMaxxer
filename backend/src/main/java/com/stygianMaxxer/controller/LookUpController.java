package com.stygianMaxxer.controller;

import java.util.*;
import lombok.*;
import org.springframework.web.bind.annotation.*;
import com.stygianMaxxer.service.*;
import com.stygianMaxxer.dto.*;

@RestController
@RequestMapping("/api")
@RequiredArgsConstructor
public class LookUpController {

    private final ElementService elementService;
    private final WeaponTypeService weaponTypeService;
    private final CharacterService characterService;
    private final BossService bossService;
    private final WeaponService weaponService;
    private final ArtifactSetService artifactSetService;

    //Elements
    @GetMapping("/elements")
    public List<ElementResponse> getElements() {
        return elementService.getAllElements();
    }

    @GetMapping("/elements/{slug}")
    public ElementResponse getElementBySlug(@PathVariable String slug) {
        return elementService.getBySlug(slug);
    }

    //WeaponTypes
    @GetMapping("/wep-types")
    public List<WeaponTypeResponse> getWeaponTypes() {
        return weaponTypeService.getAllWeaponTypes();
    }

    @GetMapping("/wep-types/{slug}")
    public WeaponTypeResponse getWeaponTypeBySlug(@PathVariable String slug) {
        return weaponTypeService.getBySlug(slug);
    }

    //Characters
    @GetMapping("/characters")
    public List<CharacterResponse> getCharacters() {
        return characterService.getAllCharacters();
    }

    @GetMapping("/characters/{slug}")
    public CharacterResponse getCharacterBySlug(@PathVariable String slug) {
        return characterService.getBySlug(slug);
    }

    @GetMapping("/characters/by-element/{elementId}")
    public List<CharacterResponse> getCharactersByElement(@PathVariable short elementId) {
        return characterService.getByElement(elementId);
    }

    @GetMapping("/characters/by-weapon/{weaponTypeId}")
    public List<CharacterResponse> getCharactersByWeapon(@PathVariable short weaponTypeId) {
        return characterService.getByWeaponType(weaponTypeId);
    }

    //Bosses
    @GetMapping("/bosses")
    public List<BossResponse> getBosses() {
        return bossService.getAllBosses();
    }

    @GetMapping("/bosses/{slug}")
    public BossResponse getBossBySlug(@PathVariable String slug) {
        return bossService.getBySlug(slug);
    }

    //Weapons
    @GetMapping("/weapons")
    public List<WeaponResponse> getWeapons() {
        return weaponService.getAllWeapons();
    }

    @GetMapping("/weapons/{slug}")
    public WeaponResponse getWeaponBySlug(@PathVariable String slug) {
        return weaponService.getBySlug(slug);
    }

    @GetMapping("/weapons/by-weapon-type/{weaponTypeId}")
    public List<WeaponResponse> getWeaponsByWeaponType(@PathVariable short weaponTypeId) {
        return weaponService.getByWeaponType(weaponTypeId);
    }

    //Artifact Sets
    @GetMapping("/artifact-sets")
    public List<ArtifactSetResponse> getArtifactSets() {
        return artifactSetService.getAllArtifactSets();
    }

    @GetMapping("/artifact-sets/{slug}")
    public ArtifactSetResponse getArtifactSetBySlug(@PathVariable String slug) {
        return artifactSetService.getBySlug(slug);
    }
}