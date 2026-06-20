package com.stygianMaxxer.model;

import jakarta.persistence.*;
import lombok.*;

import org.hibernate.annotations.JdbcTypeCode;
import org.hibernate.type.SqlTypes;

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

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "account_id", nullable = false)
    private Account account;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "stygian_id", nullable = false)
    private Stygian stygian;

    @Column(name = "post_title", nullable = false)
    private String postTitle;

    @Column(name = "post_desc", nullable = false, columnDefinition = "TEXT")
    private String postDesc;

    @Column(name = "video_link", nullable = false)
    private String videoLink;

    @Enumerated(EnumType.STRING)
    @JdbcTypeCode(SqlTypes.NAMED_ENUM)
    @Column(name = "difficulty", nullable = false)
    private Difficulty difficulty;

    @Column(name = "created_at", nullable = false)
    private OffsetDateTime createdAt;

    @Column(name = "updated_at", nullable = false)
    private OffsetDateTime updatedAt;

    @OneToMany(
            mappedBy = "post",
            cascade = CascadeType.ALL,
            orphanRemoval = true
    )
    @Builder.Default
    private List<PostBoss> bosses = new ArrayList<>();

    public void addBoss(PostBoss boss) {
        bosses.add(boss);
        boss.setPost(this);
    }

    public void removeBoss(PostBoss boss) {
        bosses.remove(boss);
        boss.setPost(null);
    }
}
