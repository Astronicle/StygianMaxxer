package com.stygianMaxxer.service;

import com.stygianMaxxer.dto.ElementResponse;
import com.stygianMaxxer.model.Element;
import com.stygianMaxxer.repository.ElementRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.NoSuchElementException;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)  // fix #11 — was missing entirely
public class ElementServiceImpl implements ElementService {

    private final ElementRepository elementRepository;

    @Override
    public List<ElementResponse> getAllElements() {
        return elementRepository.findAll()
                .stream()
                .map(this::toDto)
                .toList();
    }

    @Override
    public ElementResponse getBySlug(String slug) {
        Element element = elementRepository.findBySlug(slug)
                .orElseThrow(() -> new NoSuchElementException("Element not found: " + slug));

        return toDto(element);
    }

    private ElementResponse toDto(Element element) {
        return new ElementResponse(
                element.getId(),
                element.getSlug(),
                element.getName()
        );
    }
}
