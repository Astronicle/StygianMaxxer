package com.stygianMaxxer.service;

import com.stygianMaxxer.dto.WeaponResponse;

import java.util.List;

public interface WeaponService {

    List<WeaponResponse> getAllWeapons();

    WeaponResponse getBySlug(String slug);

    List<WeaponResponse> getByWeaponType(short weaponTypeId);
}
