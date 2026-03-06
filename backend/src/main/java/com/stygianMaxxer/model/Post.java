package com.stygianMaxxer.model;

import jakarta.persistence.*;
import lombok.*;

import java.time.OffsetDateTime;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "post")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Post {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "post_id")
    private Integer postId;

    /*
        FK → account(account_id)
        You already have Account entity.
        This is NOT part of aggregate graph logic,
        so simple ManyToOne is correct.
     */
    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "account_id", nullable = false)
    private Account account;

    /*
        FK → stygian(stygian_id)
     */
    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "stygian_id", nullable = false)
    private Stygian stygian;

    @Column(name = "post_title", nullable = false)
    private String postTitle;

    @Column(name = "post_desc", nullable = false, columnDefinition = "TEXT")
    private String postDesc;

    @Column(name = "video_link", nullable = false)
    private String videoLink;

    @Column(name = "created_at", nullable = false)
    private OffsetDateTime createdAt;

    @Column(name = "updated_at", nullable = false)
    private OffsetDateTime updatedAt;

    /*
        Aggregate boundary:
        Post → PostBoss (1–3)
     */
    @OneToMany(
            mappedBy = "post",
            cascade = CascadeType.ALL,
            orphanRemoval = true
    )
    private List<PostBoss> bosses = new ArrayList<>();

    /* ===== Helper Methods (CRITICAL) ===== */

    public void addBoss(PostBoss boss) {
        bosses.add(boss);
        boss.setPost(this);
    }

    public void removeBoss(PostBoss boss) {
        bosses.remove(boss);
        boss.setPost(null);
    }
}