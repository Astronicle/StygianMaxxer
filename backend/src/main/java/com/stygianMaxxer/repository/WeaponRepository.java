package com.stygianMaxxer.repository;

import com.stygianMaxxer.model.Weapon;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface WeaponRepository extends JpaRepository<Weapon, Short> {

    Optional<Weapon> findBySlug(String slug);

    List<Weapon> findByWeaponType_Id(Short weaponTypeId);
}
