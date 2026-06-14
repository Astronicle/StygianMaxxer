package com.stygianMaxxer.model;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "post_rating")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class PostRating {

    @EmbeddedId
    private PostRatingId id;

    @MapsId("postId")
    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "post_id", nullable = false)
    private Post post;

    @MapsId("accountId")
    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "account_id", nullable = false)
    private Account account;

    @Column(name = "rating", nullable = false)
    private short rating;
}
