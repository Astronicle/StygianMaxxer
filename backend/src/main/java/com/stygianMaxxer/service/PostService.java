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

    Page<PostSummaryResponse> getPosts(Pageable pageable);

    void ratePost(Integer postId, Integer accountId, PostRateRequest request);

    RatingSummaryResponse getRatingSummary(Integer postId);

    /**
     * Partially update a post. Only non-null fields in {@code request} are applied.
     * If {@code bosses} is provided the entire boss list is replaced.
     * Throws {@link java.util.NoSuchElementException} if the post is not found.
     * Throws {@link IllegalArgumentException} if {@code accountId} does not own the post.
     */
    PostResponse updatePost(Integer postId, Integer accountId, PostUpdateRequest request);

    /**
     * Permanently delete a post and all its child rows (cascade).
     * Throws {@link java.util.NoSuchElementException} if the post is not found.
     * Throws {@link IllegalArgumentException} if {@code accountId} does not own the post.
     */
    void deletePost(Integer postId, Integer accountId);
}
