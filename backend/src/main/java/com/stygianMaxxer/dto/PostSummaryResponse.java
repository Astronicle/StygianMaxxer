package com.stygianMaxxer.dto;

import com.stygianMaxxer.model.Difficulty;
import java.time.OffsetDateTime;
import java.util.List;

public record PostSummaryResponse(

        Integer postId,
        String title,
        String username,
        String stygianName,
        OffsetDateTime createdAt,
        Difficulty difficulty,

        Double averageRating,
        Long ratingCount,

        Long totalClearTime,           // sum of every boss's clearTime in this post, in seconds
        List<PostBossSummary> bosses   // populated by the service layer after the main query
) {
    /**
     * Used by the JPQL constructor-expression in
     * {@code PostRepository.findPostSummaries}, which only knows scalar/
     * aggregate fields — it can't populate {@code bosses} (a collection) in
     * the same query. Defaults {@code bosses} to an empty list; the service
     * layer replaces it via {@link #withBosses} after a second batched fetch.
     */
    public PostSummaryResponse(
            Integer postId,
            String title,
            String username,
            String stygianName,
            OffsetDateTime createdAt,
            Difficulty difficulty,
            Double averageRating,
            Long ratingCount,
            Long totalClearTime
    ) {
        this(postId, title, username, stygianName, createdAt, difficulty,
                averageRating, ratingCount, totalClearTime, List.of());
    }

    public PostSummaryResponse withBosses(List<PostBossSummary> bosses) {
        return new PostSummaryResponse(
                postId, title, username, stygianName, createdAt, difficulty,
                averageRating, ratingCount, totalClearTime, bosses
        );
    }
}