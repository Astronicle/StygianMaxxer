package com.stygianMaxxer.service;

import com.stygianMaxxer.dto.PostCreateRequest;
import com.stygianMaxxer.dto.PostRateRequest;
import com.stygianMaxxer.dto.PostResponse;
import com.stygianMaxxer.dto.PostSummaryResponse;
import com.stygianMaxxer.dto.PostUpdateRequest;
import com.stygianMaxxer.dto.RatingSummaryResponse;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

public interface PostService {

    PostResponse createPost(Integer accountId, PostCreateRequest request);

    PostResponse getPost(Integer postId);

    Page<PostSummaryResponse> getPosts(
            Short stygianId,
            Integer accountId,
            Short bossId,
            Short charId,
            Pageable pageable
    );

    PostResponse updatePost(Integer postId, Integer accountId, PostUpdateRequest request);

    void deletePost(Integer postId, Integer accountId);

    void ratePost(Integer postId, Integer accountId, PostRateRequest request);

    RatingSummaryResponse getRatingSummary(Integer postId);
}
