package com.stygianMaxxer.model;

import jakarta.persistence.*;
import lombok.*;

import java.util.ArrayList;
import java.util.HashSet;
import java.util.List;
import java.util.Set;

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
@NoArgsConstructor  // required by JPA
@AllArgsConstructor
@Builder
public class PostBoss {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "post_boss_id")
    private Long postBossId;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "post_id", nullable = false)
    private Post post;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "boss_id", nullable = false)
    private Boss boss;

    @Column(name = "build_info", nullable = false, columnDefinition = "TEXT")
    private String buildInfo;

    @Column(name = "clear_time", nullable = false)
    private short clearTime;   // seconds, 0-120

    @Column(name = "cost", nullable = false, precision = 4, scale = 1)
    private java.math.BigDecimal cost;   // auto-calculated team cost — see CostCalculator

    // Boss-specific tags (Ping Dependent, tool/execution tags, Cheese,
    // Over Level — see BossTag). Post-wide tags live on Post instead.
    @ElementCollection(fetch = FetchType.LAZY)
    @CollectionTable(name = "post_boss_tag", joinColumns = @JoinColumn(name = "post_boss_id"))
    @Enumerated(EnumType.STRING)
    @Column(name = "tag", nullable = false)
    @Builder.Default
    private Set<BossTag> tags = new HashSet<>();

    @OneToMany(
            mappedBy = "postBoss",
            cascade = CascadeType.ALL,
            orphanRemoval = true
    )
    @Builder.Default
    private List<PostBossCharacter> characters = new ArrayList<>();

    public void addCharacter(PostBossCharacter character) {
        characters.add(character);
        character.setPostBoss(this);
    }

    public void removeCharacter(PostBossCharacter character) {
        characters.remove(character);
        character.setPostBoss(null);
    }
}
