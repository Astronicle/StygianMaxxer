package com.stygianMaxxer.repository;

import com.stygianMaxxer.model.StygianBoss;
import com.stygianMaxxer.model.StygianBossId;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface StygianBossRepository extends JpaRepository<StygianBoss, StygianBossId> {

    List<StygianBoss> findByStygian_IdOrderBySlotAsc(Short stygianId);

    boolean existsByStygian_IdAndBoss_Id(Short stygianId, Short bossId);
}
