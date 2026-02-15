package com.stygianMaxxer.service;

import com.stygianMaxxer.dto.ElementResponse;

import java.util.List;

public interface ElementService {

    List<ElementResponse> getAllElements();

    ElementResponse getBySlug(String slug);
}