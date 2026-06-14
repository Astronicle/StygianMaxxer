package com.stygianMaxxer.repository;

import com.stygianMaxxer.model.StygianBoss;
import com.stygianMaxxer.model.StygianBossId;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import java.util.List;

public interface StygianBossRepository extends JpaRepository<StygianBoss, StygianBossId> {

    /**
     * Loads all StygianBoss rows with both stygian and boss eagerly joined.
     * Used by getAllStygians() so grouping by stygian id doesn't trigger
     * lazy proxy loads per row.
     */
    @Query("SELECT sb FROM StygianBoss sb JOIN FETCH sb.stygian JOIN FETCH sb.boss ORDER BY sb.slot ASC")
    List<StygianBoss> findAllWithStygianAndBoss();

    List<StygianBoss> findByStygian_IdOrderBySlotAsc(Short stygianId);

    boolean existsByStygian_IdAndBoss_Id(Short stygianId, Short bossId);
}
