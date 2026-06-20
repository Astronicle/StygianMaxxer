package com.stygianMaxxer.repository;

import com.stygianMaxxer.model.ArtifactSet;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface ArtifactSetRepository extends JpaRepository<ArtifactSet, Short> {

    Optional<ArtifactSet> findBySlug(String slug);
}
