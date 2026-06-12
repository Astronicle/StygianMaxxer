package com.stygianMaxxer.service;

import com.stygianMaxxer.dto.StygianBossResponse;
import com.stygianMaxxer.dto.StygianResponse;
import com.stygianMaxxer.model.Stygian;
import com.stygianMaxxer.model.StygianBoss;
import com.stygianMaxxer.repository.StygianBossRepository;
import com.stygianMaxxer.repository.StygianRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Comparator;
import java.util.List;
import java.util.Map;
import java.util.NoSuchElementException;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class StygianServiceImpl implements StygianService {

    private final StygianRepository stygianRepository;
    private final StygianBossRepository stygianBossRepository;

    /**
     * Two queries total regardless of how many stygians exist:
     *  1. SELECT all stygians
     *  2. SELECT all stygian_boss rows (with boss join), group in memory by stygian id
     *
     * Previously: 1 + N queries (one extra per stygian).
     */
    @Override
    public List<StygianResponse> getAllStygians() {

        List<Stygian> stygians = stygianRepository.findAll();

        // Load all stygian-boss rows in one shot, grouped by stygian id
        Map<Short, List<StygianBoss>> bossesByStygian = stygianBossRepository
                .findAll()
                .stream()
                .sorted(Comparator.comparing(StygianBoss::getSlot))
                .collect(Collectors.groupingBy(sb -> sb.getStygian().getId()));

        return stygians.stream()
                .map(stygian -> toResponse(
                        stygian,
                        bossesByStygian.getOrDefault(stygian.getId(), List.of())
                ))
                .toList();
    }

    @Override
    public StygianResponse getById(short id) {
        Stygian stygian = stygianRepository.findById(id)
                .orElseThrow(() -> new NoSuchElementException("Stygian not found: " + id));

        List<StygianBoss> bosses = stygianBossRepository.findByStygian_IdOrderBySlotAsc(id);

        return toResponse(stygian, bosses);
    }

    // ── Helpers ───────────────────────────────────────────────────────────────

    private List<StygianBossResponse> toBossResponses(List<StygianBoss> stygianBosses) {
        return stygianBosses.stream()
                .map(sb -> StygianBossResponse.builder()
                        .bossId(sb.getBoss().getId())
                        .bossSlug(sb.getBoss().getSlug())
                        .bossName(sb.getBoss().getName())
                        .slot(sb.getSlot())
                        .build())
                .toList();
    }

    private StygianResponse toResponse(Stygian stygian, List<StygianBoss> bosses) {
        return StygianResponse.builder()
                .id(stygian.getId())
                .name(stygian.getName())
                .version(stygian.getVersion())
                .bosses(toBossResponses(bosses))
                .build();
    }
}
