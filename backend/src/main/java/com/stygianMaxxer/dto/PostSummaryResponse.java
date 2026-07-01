package com.stygianMaxxer.dto;

import com.stygianMaxxer.model.Difficulty;
import java.math.BigDecimal;
import java.time.OffsetDateTime;
import java.util.List;

public record PostSummaryResponse(

        Integer postId,
        String title,
        String username,
        String stygianName,
        OffsetDateTime createdAt,
        Difficulty difficulty,
        String videoLink,              // used to link browse/detail cards directly to the clear video

        Double averageRating,
        Long ratingCount,

        Long totalClearTime,           // sum of every boss's clearTime in this post, in seconds
        BigDecimal totalCost,          // sum of every boss's cost in this post
        List<PostBossSummary> bosses,  // populated by the service layer after the main query

        // Populated only when the request is filtered to a single bossId
        // (the boss detail page) — this-boss-only clearTime/cost/characters,
        // as opposed to totalClearTime/totalCost/bosses above which cover
        // every boss in the post. Null otherwise.
        PostBossClearSummary bossClear
) {
    /**
     * Used by the JPQL constructor-expression in
     * {@code PostRepository.findPostSummaries}, which only knows scalar/
     * aggregate fields — it can't populate {@code bosses} (a collection) in
     * the same query. Defaults {@code bosses} to an empty list and
     * {@code bossClear} to null; the service layer replaces them via
     * {@link #withBosses} / {@link #withBossClear} after batched fetches.
     */
    public PostSummaryResponse(
            Integer postId,
            String title,
            String username,
            String stygianName,
            OffsetDateTime createdAt,
            Difficulty difficulty,
            String videoLink,
            Double averageRating,
            Long ratingCount,
            Long totalClearTime,
            BigDecimal totalCost
    ) {
        this(postId, title, username, stygianName, createdAt, difficulty, videoLink,
                averageRating, ratingCount, totalClearTime, totalCost, List.of(), null);
    }

    public PostSummaryResponse withBosses(List<PostBossSummary> bosses) {
        return new PostSummaryResponse(
                postId, title, username, stygianName, createdAt, difficulty, videoLink,
                averageRating, ratingCount, totalClearTime, totalCost, bosses, bossClear
        );
    }

    public PostSummaryResponse withBossClear(PostBossClearSummary bossClear) {
        return new PostSummaryResponse(
                postId, title, username, stygianName, createdAt, difficulty, videoLink,
                averageRating, ratingCount, totalClearTime, totalCost, bosses, bossClear
        );
    }
}
