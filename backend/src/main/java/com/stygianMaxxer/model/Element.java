package com.stygianMaxxer.model;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "element")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@EqualsAndHashCode(of = "id")
public class Element {

    @Id
    @Column(name = "element_id", nullable = false)
    private short id;

    @Column(name = "element_slug", nullable = false,  unique = true)
    private String slug;

    @Column(name = "element_name", nullable = false, unique = true)
    private String name;
}
