package com.stygianMaxxer.repository;


import com.stygianMaxxer.model.WeaponType;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface WeaponTypeRepository extends JpaRepository<WeaponType, Short> {

    Optional<WeaponType> findBySlug(String slug);
}