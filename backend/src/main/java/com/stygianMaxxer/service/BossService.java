package com.stygianMaxxer.service;

import com.stygianMaxxer.dto.BossResponse;

import java.util.List;

public interface BossService {

    List<BossResponse> getAllBosses();

    BossResponse getBySlug(String slug);
}