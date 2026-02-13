package com.stygianMaxxer.model;

import jakarta.persistence.*;
import lombok.*;

import java.io.Serializable;

@Embeddable
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@EqualsAndHashCode
public class StygianBossId implements Serializable {

    @Column(name = "stygian_id")
    private short stygianId;

    @Column(name = "boss_id")
    private short bossId;
}
