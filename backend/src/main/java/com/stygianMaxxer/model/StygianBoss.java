package com.stygianMaxxer.model;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "stygian_boss",
        uniqueConstraints = {
                @UniqueConstraint(
                        name = "uk_boss_slot",
                        columnNames = {"boss_id", "slot"}
                )
        }
)
@Getter
@Setter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
@EqualsAndHashCode(of = "id")
public class StygianBoss {

    @EmbeddedId
    private StygianBossId id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @MapsId("stygianId")
    @JoinColumn(name = "stygian_id", nullable = false)
    private Stygian stygian;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @MapsId("bossId")
    @JoinColumn(name = "boss_id", nullable = false)
    private Boss boss;

    @Column(name = "slot", nullable = false)
    private Short slot;
}
