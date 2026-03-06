package com.stygianMaxxer.repository;

import com.stygianMaxxer.model.Post;
import org.springframework.data.jpa.repository.*;
import org.springframework.stereotype.Repository;
import com.stygianMaxxer.dto.PostSummaryResponse;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.Query;

import java.util.Optional;

@Repository
public interface PostRepository extends JpaRepository<Post, Integer> {

    /*
        Fetch full aggregate in one query.
        Critical to avoid N+1.
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
    GROUP BY p.postId, p.postTitle, a.username, s.name, p.createdAt
""")
    Page<PostSummaryResponse> findPostSummaries(Pageable pageable);
}