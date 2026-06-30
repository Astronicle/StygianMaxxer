package com.stygianMaxxer.service;

import com.stygianMaxxer.dto.BossResponse;
import com.stygianMaxxer.dto.PostCreateRequest;
import com.stygianMaxxer.dto.PostRateRequest;
import com.stygianMaxxer.dto.PostResponse;
import com.stygianMaxxer.dto.PostSummaryResponse;
import com.stygianMaxxer.dto.PostUpdateRequest;
import com.stygianMaxxer.dto.RatingSummaryResponse;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

import java.math.BigDecimal;
import java.util.List;

public interface PostService {

    PostResponse createPost(Integer accountId, PostCreateRequest request);

    PostResponse getPost(Integer postId);

    Page<PostSummaryResponse> getPosts(
            Short stygianId,
            Integer accountId,
            Short bossId,
            Short charId,
            String difficulty,
            String titleSearch,
            BigDecimal minCost,
            BigDecimal maxCost,
            Integer minTime,
            Integer maxTime,
            List<Short> charInclude,
            String includeMode,     // "AND" or "OR"; ignored when charInclude is empty
            List<Short> charExclude,
            Boolean allBossesOnly,  // stygian page: post must clear every boss in the stygian
            Pageable pageable
    );

    PostResponse updatePost(Integer postId, Integer accountId, PostUpdateRequest request);

    void deletePost(Integer postId, Integer accountId);

    void ratePost(Integer postId, Integer accountId, PostRateRequest request);

    RatingSummaryResponse getRatingSummary(Integer postId);

    // Null if this account hasn't rated the post.
    Short getMyRating(Integer postId, Integer accountId);

    // Bosses killed in a post — lightweight (id, slug, name) for icon display
    List<BossResponse> getPostBosses(Integer postId);
}
