package com.stygianMaxxer.controller;

import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import com.stygianMaxxer.service.StygianService;
import com.stygianMaxxer.dto.StygianResponse;

import java.util.List;

@RestController
@RequestMapping("/api/stygian")
@RequiredArgsConstructor
public class StygianController {

    private final StygianService stygianService;

    @GetMapping
    public List<StygianResponse> getAllStygians() {
        return stygianService.getAllStygians();
    }

    @GetMapping("/{id}")
    public StygianResponse getStygianById(@PathVariable short id) {
        return stygianService.getById(id);
    }
}
