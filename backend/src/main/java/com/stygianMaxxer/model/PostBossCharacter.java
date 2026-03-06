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
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class PostBossCharacter {

    @EmbeddedId
    private PostBossCharacterId id;

    /*
        Maps post_boss_id from composite key
     */
    @MapsId("postBossId")
    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "post_boss_id", nullable = false)
    private PostBoss postBoss;

    /*
        FK → character(char_id)
     */
    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "char_id", nullable = false)
    private Character character;

    @Column(name = "has_sig", nullable = false)
    private boolean hasSig;

    @Column(name = "cons", nullable = false)
    private short cons;

    /*
        Convenience getter for slot
     */
    public short getSlot() {
        return id != null ? id.getSlot() : 0;
    }

    public void setSlot(short slot) {
        if (this.id == null) {
            this.id = new PostBossCharacterId();
        }
        this.id.setSlot(slot);
    }
}