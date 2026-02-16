package com.stygianMaxxer.service;

import com.stygianMaxxer.dto.BossResponse;
import com.stygianMaxxer.model.Boss;
import com.stygianMaxxer.repository.BossRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class BossServiceImpl implements BossService {

    private final BossRepository bossRepository;

    @Override
    public List<BossResponse> getAllBosses() {
        return bossRepository.findAll(Sort.by("id"))
                .stream()
                .map(this::toDto)
                .toList();
    }

    @Override
    public BossResponse getBySlug(String slug) {
        Boss boss = bossRepository.findBySlug(slug)
                .orElseThrow(() -> new RuntimeException("Boss not found"));

        return toDto(boss);
    }

    private BossResponse toDto(Boss boss) {
        return new BossResponse(
                boss.getId(),
                boss.getSlug(),
                boss.getName()
        );
    }
}
