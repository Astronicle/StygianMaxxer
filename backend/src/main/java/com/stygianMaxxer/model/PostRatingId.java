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
public class PostRatingId implements Serializable {

    @Column(name = "post_id")
    private Integer postId;

    @Column(name = "account_id")
    private Integer accountId;

    @Override
    public boolean equals(Object o) {
        if (this == o) return true;
        if (!(o instanceof PostRatingId that)) return false;
        return Objects.equals(postId, that.postId)
                && Objects.equals(accountId, that.accountId);
    }

    @Override
    public int hashCode() {
        return Objects.hash(postId, accountId);
    }
}