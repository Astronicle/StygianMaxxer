package com.stygianMaxxer.repository;

import com.stygianMaxxer.model.Character;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;
import java.util.Optional;

public interface CharacterRepository extends JpaRepository<Character, Short> {

    Optional<Character> findBySlug(String slug);
    List<Character> findByElement_Id(Short elementId);
    List<Character> findByWeaponType_Id(Short weaponTypeId);

}

