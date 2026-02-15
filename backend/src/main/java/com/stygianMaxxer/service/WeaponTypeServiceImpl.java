package com.stygianMaxxer.service;

import com.stygianMaxxer.dto.WeaponTypeResponse;
import com.stygianMaxxer.model.WeaponType;
import com.stygianMaxxer.repository.WeaponTypeRepository;
import lombok.*;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.*;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class WeaponTypeServiceImpl implements WeaponTypeService {

    private final WeaponTypeRepository weaponTypeRepository;

    @Override
    public List<WeaponTypeResponse> getAllWeaponTypes() {
        return weaponTypeRepository.findAll(Sort.by("id"))
                .stream()
                .map(this::toDto)
                .toList();
    }

    @Override
    public WeaponTypeResponse getBySlug(String slug) {
        WeaponType weaponType = weaponTypeRepository.findBySlug(slug)
                .orElseThrow(() -> new RuntimeException("Weapon type not found"));

        return toDto(weaponType);
    }

    private WeaponTypeResponse toDto(WeaponType weaponType) {
        return new WeaponTypeResponse(
                weaponType.getId(),
                weaponType.getSlug(),
                weaponType.getName()
        );
    }
}