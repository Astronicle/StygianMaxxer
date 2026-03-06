package com.stygianMaxxer.model;

import jakarta.persistence.*;
import lombok.*;

import java.io.Serializable;
import java.util.Objects;

@Embeddable
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class PostBossCharacterId implements Serializable {

    @Column(name = "post_boss_id")
    private Long postBossId;

    @Column(name = "slot")
    private Short slot;

    @Override
    public boolean equals(Object o) {
        if (this == o) return true;
        if (!(o instanceof PostBossCharacterId that)) return false;
        return Objects.equals(postBossId, that.postBossId)
                && Objects.equals(slot, that.slot);
    }

    @Override
    public int hashCode() {
        return Objects.hash(postBossId, slot);
    }
}