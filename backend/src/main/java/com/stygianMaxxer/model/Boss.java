package com.stygianMaxxer.model;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "boss")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@EqualsAndHashCode(of = "id")
public class Boss {

    @Id
    @Column(name = "boss_id", nullable = false)
    private short id;

    @Column(name = "boss_slug", nullable = false, unique = true)
    private String slug;

    @Column(name = "boss_name", nullable = false, unique = true)
    private String name;
}
