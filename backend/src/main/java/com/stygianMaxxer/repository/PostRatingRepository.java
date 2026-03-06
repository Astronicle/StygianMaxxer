package com.stygianMaxxer.repository;

import com.stygianMaxxer.dto.RatingSummaryResponse;
import com.stygianMaxxer.model.PostRating;
import com.stygianMaxxer.model.PostRatingId;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

public interface PostRatingRepository extends JpaRepository<PostRating, PostRatingId> {

    @Query("""
           select new com.stygianMaxxer.dto.RatingSummaryResponse(
               CAST(coalesce(avg(pr.rating), 0.0) AS DOUBLE),
               count(pr)
           )
           from PostRating pr
           where pr.post.postId = :postId
           """)
    RatingSummaryResponse getSummaryByPostId(@Param("postId") Integer postId);
}