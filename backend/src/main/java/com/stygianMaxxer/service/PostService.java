package com.stygianMaxxer.service;

import com.stygianMaxxer.dto.PostCreateRequest;
import com.stygianMaxxer.dto.PostResponse;
import com.stygianMaxxer.dto.PostSummaryResponse;
import com.stygianMaxxer.dto.PostRateRequest;
import com.stygianMaxxer.dto.RatingSummaryResponse;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

public interface PostService {

    PostResponse createPost(PostCreateRequest request);

    PostResponse getPost(Integer postId);

    Page<PostSummaryResponse> getPosts(Pageable pageable);

    void ratePost(Integer postId, PostRateRequest request);

    RatingSummaryResponse getRatingSummary(Integer postId);
}