package com.stygianMaxxer.model;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "wep_type")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@EqualsAndHashCode(of = "id")
public class WeaponType {

    @Id
    @Column(name = "wep_type_id", nullable = false)
    private short id;

    @Column(name = "wep_type_slug", nullable = false, unique = true)
    private String slug;

    @Column(name = "wep_type_name", nullable = false, unique = true)
    private String name;
}
