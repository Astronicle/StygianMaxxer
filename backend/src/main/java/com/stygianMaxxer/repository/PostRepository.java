package com.stygianMaxxer.repository;

import com.stygianMaxxer.dto.PostSummaryResponse;
import com.stygianMaxxer.model.Post;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface PostRepository extends JpaRepository<Post, Integer> {

    /*
        Fetch full aggregate in one query — avoids N+1.
     */
    @EntityGraph(attributePaths = {
            "bosses",
            "bosses.boss",
            "bosses.characters",
            "bosses.characters.character",
            "account",
            "stygian"
    })
    Optional<Post> findWithGraphByPostId(Integer postId);

    /*
        Paginated list with optional filters.

        All three filter params are optional — pass null to skip that filter.
        Filters can be combined freely (e.g. stygianId + accountId together).

        bossId filters via a subquery on PostBoss since Boss is nested one
        level below Post. Character filtering works the same way.
     */
    @Query("""
        SELECT new com.stygianMaxxer.dto.PostSummaryResponse(
            p.postId,
            p.postTitle,
            a.username,
            s.name,
            p.createdAt,
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
        GROUP BY p.postId, p.postTitle, a.username, s.name, p.createdAt
    """)
    Page<PostSummaryResponse> findPostSummaries(
            @Param("stygianId") Short stygianId,
            @Param("accountId") Integer accountId,
            @Param("bossId")    Short bossId,
            @Param("charId")    Short charId,
            Pageable pageable
    );
}
