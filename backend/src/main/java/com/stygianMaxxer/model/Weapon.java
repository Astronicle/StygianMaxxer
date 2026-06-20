package com.stygianMaxxer.model;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "weapon")
@Getter
@Setter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
@EqualsAndHashCode(of = "id")
public class Weapon {

    @Id
    @Column(name = "weapon_id", nullable = false)
    private short id;

    @Column(name = "weapon_slug", nullable = false, unique = true)
    private String slug;

    @Column(name = "weapon_name", nullable = false, unique = true)
    private String name;

    @Column(name = "rarity", nullable = false)
    private short rarity;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "wep_type_id", nullable = false)
    private WeaponType weaponType;
}
