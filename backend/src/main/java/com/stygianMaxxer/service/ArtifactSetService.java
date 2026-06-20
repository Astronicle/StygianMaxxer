package com.stygianMaxxer.service;

import com.stygianMaxxer.dto.ArtifactSetResponse;

import java.util.List;

public interface ArtifactSetService {

    List<ArtifactSetResponse> getAllArtifactSets();

    ArtifactSetResponse getBySlug(String slug);
}
