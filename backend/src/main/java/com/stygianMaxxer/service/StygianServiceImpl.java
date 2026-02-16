package com.stygianMaxxer.service;

import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.stygianMaxxer.repository.*;
import com.stygianMaxxer.model.*;
import com.stygianMaxxer.dto.*;

import java.util.List;
import java.util.stream.Collectors;

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
                .map(stygian -> {

                    List<StygianBossResponse> bosses =
                            stygianBossRepository
                                    .findByStygian_IdOrderBySlotAsc(stygian.getId())
                                    .stream()
                                    .map(sb -> StygianBossResponse.builder()
                                            .bossId(sb.getBoss().getId())
                                            .bossSlug(sb.getBoss().getSlug())
                                            .bossName(sb.getBoss().getName())
                                            .slot(sb.getSlot())
                                            .build())
                                    .toList();

                    return StygianResponse.builder()
                            .id(stygian.getId())
                            .name(stygian.getName())
                            .version(stygian.getVersion())
                            .bosses(bosses)
                            .build();
                })
                .toList();
    }


    @Override
    public StygianResponse getById(short id) {

        Stygian stygian = stygianRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Stygian not found"));

        List<StygianBossResponse> bosses =
                stygianBossRepository
                        .findByStygian_IdOrderBySlotAsc(id)
                        .stream()
                        .map(sb -> StygianBossResponse.builder()
                                .bossId(sb.getBoss().getId())
                                .bossSlug(sb.getBoss().getSlug())
                                .bossName(sb.getBoss().getName())
                                .slot(sb.getSlot())
                                .build())
                        .collect(Collectors.toList());

        return StygianResponse.builder()
                .id(stygian.getId())
                .name(stygian.getName())
                .version(stygian.getVersion())
                .bosses(bosses)
                .build();
    }
}
