package com.stygianMaxxer.service;

import com.stygianMaxxer.dto.StygianBossResponse;
import com.stygianMaxxer.dto.StygianResponse;
import com.stygianMaxxer.model.Stygian;
import com.stygianMaxxer.repository.StygianBossRepository;
import com.stygianMaxxer.repository.StygianRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.NoSuchElementException;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class StygianServiceImpl implements StygianService {

    private final StygianRepository stygianRepository;
    private final StygianBossRepository stygianBossRepository;

    @Override
    public List<StygianResponse> getAllStygians() {
        return stygianRepository.findAll()
                .stream()
                .map(stygian -> toResponse(stygian, fetchBosses(stygian.getId())))
                .toList();
    }

    @Override
    public StygianResponse getById(short id) {
        Stygian stygian = stygianRepository.findById(id)
                .orElseThrow(() -> new NoSuchElementException("Stygian not found: " + id));

        return toResponse(stygian, fetchBosses(id));
    }

    // ── Helpers ───────────────────────────────────────────────────────────────

    private List<StygianBossResponse> fetchBosses(short stygianId) {
        return stygianBossRepository
                .findByStygian_IdOrderBySlotAsc(stygianId)
                .stream()
                .map(sb -> StygianBossResponse.builder()
                        .bossId(sb.getBoss().getId())
                        .bossSlug(sb.getBoss().getSlug())
                        .bossName(sb.getBoss().getName())
                        .slot(sb.getSlot())
                        .build())
                .toList();
    }

    private StygianResponse toResponse(Stygian stygian, List<StygianBossResponse> bosses) {
        return StygianResponse.builder()
                .id(stygian.getId())
                .name(stygian.getName())
                .version(stygian.getVersion())
                .bosses(bosses)
                .build();
    }
}
