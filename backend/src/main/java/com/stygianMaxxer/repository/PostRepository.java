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
        LEFT JOIN FETCH pbc.weapon w
        LEFT JOIN FETCH w.weaponType
        LEFT JOIN FETCH pbc.artifactSet
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
            COUNT(r.rating),
            CAST(COALESCE((
                SELECT SUM(pb2.clearTime) FROM PostBoss pb2 WHERE pb2.post = p
            ), 0) AS long),
            COALESCE((
                SELECT SUM(pb3.cost) FROM PostBoss pb3 WHERE pb3.post = p
            ), 0)
        )
        FROM Post p
        JOIN p.account a
        JOIN p.stygian s
        LEFT JOIN PostRating r ON r.post.postId = p.postId
        WHERE
            (:stygianId   IS NULL OR s.id            = :stygianId)
        AND (:accountId   IS NULL OR a.accountId     = :accountId)
        AND (:bossId      IS NULL OR EXISTS (
                SELECT 1 FROM PostBoss pb WHERE pb.post = p AND pb.boss.id = :bossId
            ))
        AND (:charId      IS NULL OR EXISTS (
                SELECT 1 FROM PostBoss pb JOIN pb.characters pbc
                WHERE pb.post = p AND pbc.character.id = :charId
            ))
        AND (:difficulty  IS NULL OR CAST(p.difficulty AS string) = :difficulty)
        AND (:minCost     IS NULL OR (
                SELECT COALESCE(SUM(pb4.cost), 0) FROM PostBoss pb4 WHERE pb4.post = p
            ) >= :minCost)
        AND (:maxCost     IS NULL OR (
                SELECT COALESCE(SUM(pb5.cost), 0) FROM PostBoss pb5 WHERE pb5.post = p
            ) <= :maxCost)
        AND (:minTime     IS NULL OR (
                SELECT COALESCE(SUM(pb6.clearTime), 0) FROM PostBoss pb6 WHERE pb6.post = p
            ) >= :minTime)
        AND (:maxTime     IS NULL OR (
                SELECT COALESCE(SUM(pb7.clearTime), 0) FROM PostBoss pb7 WHERE pb7.post = p
            ) <= :maxTime)
        GROUP BY p.postId, p.postTitle, a.username, s.name, p.createdAt, p.difficulty
    """)
    Page<PostSummaryResponse> findPostSummaries(
            @Param("stygianId")  Short stygianId,
            @Param("accountId")  Integer accountId,
            @Param("bossId")     Short bossId,
            @Param("charId")     Short charId,
            @Param("difficulty") String difficulty,
            @Param("minCost")    java.math.BigDecimal minCost,
            @Param("maxCost")    java.math.BigDecimal maxCost,
            @Param("minTime")    Integer minTime,
            @Param("maxTime")    Integer maxTime,
            Pageable pageable
    );

    // ── Per-boss summaries for a page of posts (browse cards) ──────────────────
    // Given a list of post ids, fetches (postId, bossId, bossSlug, bossName,
    // clearTime, cost) for every boss in those posts as plain Object[] rows —
    // kept as scalars (not a DTO constructor expression) so postId can ride
    // along for grouping in the service layer. Used to attach the `bosses`
    // list onto PostSummaryResponse after the main aggregate query above.
    // One query regardless of page size — not N+1.
    @Query("""
        SELECT p.postId, b.id, b.slug, b.name, pb.clearTime, pb.cost
        FROM PostBoss pb
        JOIN pb.post p
        JOIN pb.boss b
        WHERE p.postId IN :postIds
        ORDER BY p.postId, b.name
    """)
    List<Object[]> findBossSummariesForPosts(@Param("postIds") List<Integer> postIds);

    // ── Character icons for ALL bosses, across a page of posts ─────────────────
    // Returns (postId, bossId, charId, charSlug, charName) — grouped by
    // postId and bossId — so the service layer can map characters onto each
    // PostBossSummary. Used on the stygian/browse pages where bossId is not
    // filtered. Ordered by slot so character order is consistent.
    @Query("""
        SELECT p.postId, pb.boss.id, c.id, c.slug, c.name
        FROM PostBoss pb
        JOIN pb.post p
        JOIN pb.characters pbc
        JOIN pbc.character c
        WHERE p.postId IN :postIds
        ORDER BY p.postId, pb.boss.id, pbc.id.slot
    """)
    List<Object[]> findCharacterIconsForAllBossesInPosts(@Param("postIds") List<Integer> postIds);

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
