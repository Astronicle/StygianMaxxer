package com.stygianMaxxer.service;

import com.stygianMaxxer.dto.ElementResponse;
import com.stygianMaxxer.model.Element;
import com.stygianMaxxer.repository.ElementRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
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
                .orElseThrow(() -> new RuntimeException("Element not found"));

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
