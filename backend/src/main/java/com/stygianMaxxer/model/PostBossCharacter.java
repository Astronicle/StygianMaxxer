package com.stygianMaxxer.model;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(
        name = "post_boss_character",
        uniqueConstraints = {
                @UniqueConstraint(
                        name = "uk_pbc_postboss_char",
                        columnNames = {"post_boss_id", "char_id"}
                )
        }
)
@Getter
@Setter
@NoArgsConstructor  // required by JPA
// @AllArgsConstructor removed — it generated a constructor taking `id` as a
// parameter, conflicting with how @Builder + setSlot() are used together.
// The builder leaves id null, then setSlot() initialises it — using
// @AllArgsConstructor directly would bypass that and allow a mis-constructed entity.
@Builder
public class PostBossCharacter {

    @EmbeddedId
    private PostBossCharacterId id;

    @MapsId("postBossId")
    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "post_boss_id", nullable = false)
    private PostBoss postBoss;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "char_id", nullable = false)
    private Character character;

    @Column(name = "has_sig", nullable = false)
    private boolean hasSig;

    @Column(name = "cons", nullable = false)
    private short cons;

    /**
     * Always call this after building — it initialises the embedded PK.
     * Without it the entity has a null id and JPA will throw at flush time.
     */
    public void setSlot(short slot) {
        if (this.id == null) {
            this.id = new PostBossCharacterId();
        }
        this.id.setSlot(slot);
    }

    public short getSlot() {
        return id != null ? id.getSlot() : 0;
    }
}
