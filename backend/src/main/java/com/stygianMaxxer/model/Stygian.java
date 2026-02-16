package com.stygianMaxxer.model;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "stygian")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@EqualsAndHashCode(of = "id")
public class Stygian {

    @Id
    @Column(name = "stygian_id", nullable = false)
    private short id;

    @Column(name = "stygian_name", nullable = false, unique = true)
    private String name;

    @Column(name = "version", nullable = false, unique = true)
    private String version;
}
