package com.stygianMaxxer.repository;

import com.stygianMaxxer.model.Element;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface ElementRepository extends JpaRepository<Element, Short> {

    Optional<Element> findBySlug(String slug);
}
