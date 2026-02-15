package com.stygianMaxxer.service;

import com.stygianMaxxer.dto.WeaponTypeResponse;

import java.util.List;

public interface WeaponTypeService {

    List<WeaponTypeResponse> getAllWeaponTypes();

    WeaponTypeResponse getBySlug(String slug);
}