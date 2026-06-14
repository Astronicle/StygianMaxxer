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
@AllArgsConstructor
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
