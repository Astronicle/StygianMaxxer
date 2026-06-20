package com.stygianMaxxer.repository;

import com.stygianMaxxer.dto.PostSummaryResponse;
import com.stygianMaxxer.model.Post;
import com.stygianMaxxer.model.PostBoss;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface PostRepository extends JpaRepository<Post, Integer> {

    // ── Query 1 ───────────────────────────────────────────────────────────────
    // Fetches the Post row itself, plus its bosses list and the boss/account/
    // stygian many-to-ones — everything EXCEPT characters.
    // One LEFT JOIN per association, no Cartesian product problem because
    // there is only one bag (bosses) being joined here.
    @Query("""
        SELECT DISTINCT p
        FROM Post p
        LEFT JOIN FETCH p.bosses pb
        LEFT JOIN FETCH pb.boss
        LEFT JOIN FETCH p.account
        LEFT JOIN FETCH p.stygian
        WHERE p.postId = :postId
    """)
    Optional<Post> findPostWithBosses(@Param("postId") Integer postId);

    // ── Query 2 ───────────────────────────────────────────────────────────────
    // Given a list of PostBoss primary-key ids, fetches those PostBoss rows
    // and eagerly joins their characters + the character many-to-one.
    // Uses an IN clause so this is always exactly ONE query regardless of
    // how many bosses the post has — not N+1.
    @Query("""
        SELECT DISTINCT pb
        FROM PostBoss pb
        LEFT JOIN FETCH pb.characters pbc
        LEFT JOIN FETCH pbc.character
        WHERE pb.postBossId IN :bossIds
    """)
    List<PostBoss> findBossesWithCharacters(@Param("bossIds") List<Long> bossIds);

    // Paginated list
    @Query("""
        SELECT new com.stygianMaxxer.dto.PostSummaryResponse(
            p.postId,
            p.postTitle,
            a.username,
            s.name,
            p.createdAt,
            p.difficulty,
            CAST(COALESCE(AVG(r.rating), 0.0) AS double),
            COUNT(r.rating)
        )
        FROM Post p
        JOIN p.account a
        JOIN p.stygian s
        LEFT JOIN PostRating r ON r.post.postId = p.postId
        WHERE
            (:stygianId  IS NULL OR s.id         = :stygianId)
        AND (:accountId  IS NULL OR a.accountId  = :accountId)
        AND (:bossId     IS NULL OR EXISTS (
                SELECT 1 FROM PostBoss pb
                WHERE pb.post = p AND pb.boss.id = :bossId
            ))
        AND (:charId     IS NULL OR EXISTS (
                SELECT 1 FROM PostBoss pb
                JOIN pb.characters pbc
                WHERE pb.post = p AND pbc.character.id = :charId
            ))
        GROUP BY p.postId, p.postTitle, a.username, s.name, p.createdAt, p.difficulty
    """)
    Page<PostSummaryResponse> findPostSummaries(
            @Param("stygianId") Short stygianId,
            @Param("accountId") Integer accountId,
            @Param("bossId")    Short bossId,
            @Param("charId")    Short charId,
            Pageable pageable
    );

    // ── Bosses killed in a post (lightweight, no character detail) ──────────────
    // Used by post summary cards (e.g. the user profile post list) to show
    // which boss icons belong to a given post without loading the full
    // Post + characters graph.
    @Query("""
        SELECT DISTINCT b
        FROM PostBoss pb
        JOIN pb.boss b
        WHERE pb.post.postId = :postId
        ORDER BY b.name
    """)
    List<com.stygianMaxxer.model.Boss> findBossesForPost(@Param("postId") Integer postId);
}
