package com.stygianMaxxer.model;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "character")
@Getter
@Setter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
@EqualsAndHashCode(of = "id")
public class Character {

    @Id
    @Column(name = "char_id", nullable = false)
    private short id;

    @Column(name = "char_slug", nullable = false, unique = true)
    private String slug;

    @Column(name = "char_name", nullable = false, unique = true)
    private String name;

    @Column(name = "rarity", nullable = false)
    private short rarity;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "wep_type_id", nullable = false)
    private WeaponType weaponType;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "element_id", nullable = false)
    private Element element;
}
