package com.stygianMaxxer.model;

import jakarta.persistence.*;
import lombok.*;

import java.util.ArrayList;
import java.util.List;

@Entity
@Table(
        name = "post_boss",
        uniqueConstraints = {
                @UniqueConstraint(
                        name = "uk_postboss_post_boss",
                        columnNames = {"post_id", "boss_id"}
                )
        }
)
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class PostBoss {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "post_boss_id")
    private Long postBossId;

    /*
        FK → post(post_id)
        ON DELETE CASCADE handled at DB level.
        Cascade handled by aggregate root.
     */
    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "post_id", nullable = false)
    private Post post;

    /*
        FK → boss(boss_id)
        Lookup entity. No cascade.
     */
    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "boss_id", nullable = false)
    private Boss boss;

    @Column(name = "build_info", nullable = false, columnDefinition = "TEXT")
    private String buildInfo;

    /*
        PostBoss → PostBossCharacter (1–4)
     */
    @OneToMany(
            mappedBy = "postBoss",
            cascade = CascadeType.ALL,
            orphanRemoval = true
    )
    private List<PostBossCharacter> characters = new ArrayList<>();

    /* ===== Helper Methods ===== */

    public void addCharacter(PostBossCharacter character) {
        characters.add(character);
        character.setPostBoss(this);
    }

    public void removeCharacter(PostBossCharacter character) {
        characters.remove(character);
        character.setPostBoss(null);
    }
}