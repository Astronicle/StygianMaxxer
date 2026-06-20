package com.stygianMaxxer.model;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "artifact_set")
@Getter
@Setter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
@EqualsAndHashCode(of = "id")
public class ArtifactSet {

    @Id
    @Column(name = "artifact_set_id", nullable = false)
    private short id;

    @Column(name = "artifact_set_slug", nullable = false, unique = true)
    private String slug;

    @Column(name = "artifact_set_name", nullable = false, unique = true)
    private String name;
}
