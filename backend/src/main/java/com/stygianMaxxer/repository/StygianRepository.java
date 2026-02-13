package com.stygianMaxxer.repository;

import com.stygianMaxxer.model.Stygian;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface StygianRepository extends JpaRepository<Stygian, Short> {

    Optional<Stygian> findByVersion(String version);
}
