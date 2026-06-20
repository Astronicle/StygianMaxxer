package com.stygianMaxxer.service;

import com.stygianMaxxer.dto.LookupRef;
import com.stygianMaxxer.dto.WeaponResponse;
import com.stygianMaxxer.model.Weapon;
import com.stygianMaxxer.repository.WeaponRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.NoSuchElementException;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class WeaponServiceImpl implements WeaponService {

    private final WeaponRepository weaponRepository;

    @Override
    public List<WeaponResponse> getAllWeapons() {
        return weaponRepository.findAll(Sort.by("id"))
                .stream()
                .map(this::toDto)
                .toList();
    }

    @Override
    public WeaponResponse getBySlug(String slug) {
        Weapon weapon = weaponRepository.findBySlug(slug)
                .orElseThrow(() -> new NoSuchElementException("Weapon not found: " + slug));

        return toDto(weapon);
    }

    @Override
    public List<WeaponResponse> getByWeaponType(short weaponTypeId) {
        return weaponRepository.findByWeaponType_Id(weaponTypeId)
                .stream()
                .map(this::toDto)
                .toList();
    }

    private WeaponResponse toDto(Weapon weapon) {
        return new WeaponResponse(
                weapon.getId(),
                weapon.getSlug(),
                weapon.getName(),
                weapon.getRarity(),
                new LookupRef(
                        weapon.getWeaponType().getId(),
                        weapon.getWeaponType().getSlug(),
                        weapon.getWeaponType().getName()
                )
        );
    }
}
