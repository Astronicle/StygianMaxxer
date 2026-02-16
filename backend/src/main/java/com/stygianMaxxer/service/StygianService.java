package com.stygianMaxxer.service;

import com.stygianMaxxer.dto.StygianResponse;

import java.util.List;

public interface StygianService {

    List<StygianResponse> getAllStygians();

    StygianResponse getById(short id);
}
