package com.stygianMaxxer.service;

import com.stygianMaxxer.dto.ArtifactSetResponse;
import com.stygianMaxxer.model.ArtifactSet;
import com.stygianMaxxer.repository.ArtifactSetRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.NoSuchElementException;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class ArtifactSetServiceImpl implements ArtifactSetService {

    private final ArtifactSetRepository artifactSetRepository;

    @Override
    public List<ArtifactSetResponse> getAllArtifactSets() {
        return artifactSetRepository.findAll(Sort.by("id"))
                .stream()
                .map(this::toDto)
                .toList();
    }

    @Override
    public ArtifactSetResponse getBySlug(String slug) {
        ArtifactSet artifactSet = artifactSetRepository.findBySlug(slug)
                .orElseThrow(() -> new NoSuchElementException("Artifact set not found: " + slug));

        return toDto(artifactSet);
    }

    private ArtifactSetResponse toDto(ArtifactSet artifactSet) {
        return new ArtifactSetResponse(
                artifactSet.getId(),
                artifactSet.getSlug(),
                artifactSet.getName()
        );
    }
}
