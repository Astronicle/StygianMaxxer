package com.stygianMaxxer.repository;

import com.stygianMaxxer.model.Boss;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface BossRepository extends JpaRepository<Boss, Short> {

    Optional<Boss> findBySlug(String slug);
}
