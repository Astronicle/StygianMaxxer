package com.stygianMaxxer.controller;

import com.stygianMaxxer.dto.PostCreateRequest;
import com.stygianMaxxer.dto.PostRateRequest;
import com.stygianMaxxer.dto.PostResponse;
import com.stygianMaxxer.dto.PostSummaryResponse;
import com.stygianMaxxer.dto.PostUpdateRequest;
import com.stygianMaxxer.dto.RatingSummaryResponse;
import com.stygianMaxxer.security.AuthPrincipal;
import com.stygianMaxxer.service.PostService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpStatus;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/posts")
@RequiredArgsConstructor
public class PostController {

    private final PostService postService;

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public PostResponse createPost(
            @AuthenticationPrincipal AuthPrincipal principal,
            @Valid @RequestBody PostCreateRequest request
    ) {
        return postService.createPost(principal.accountId(), request);
    }

    @GetMapping("/{postId}")
    public PostResponse getPost(@PathVariable Integer postId) {
        return postService.getPost(postId);
    }

    @GetMapping
    public Page<PostSummaryResponse> getPosts(Pageable pageable) {
        return postService.getPosts(pageable);
    }

    @PostMapping("/{postId}/rate")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void ratePost(
            @PathVariable Integer postId,
            @AuthenticationPrincipal AuthPrincipal principal,
            @Valid @RequestBody PostRateRequest request
    ) {
        postService.ratePost(postId, principal.accountId(), request);
    }

    @GetMapping("/{postId}/rating-summary")
    public RatingSummaryResponse getRatingSummary(@PathVariable Integer postId) {
        return postService.getRatingSummary(postId);
    }

    /**
     * PUT /api/posts/{postId}
     *
     * Partially update a post owned by the authenticated user.
     * Any field left null in the request body keeps its current value.
     * If {@code bosses} is provided it fully replaces the existing boss list.
     *
     * Returns 200 OK with the updated PostResponse.
     * Returns 404 if the post does not exist (GlobalExceptionHandler maps NoSuchElementException).
     * Returns 400 if the authenticated user does not own the post (GlobalExceptionHandler maps IllegalArgumentException).
     */
    @PutMapping("/{postId}")
    public PostResponse updatePost(
            @PathVariable Integer postId,
            @AuthenticationPrincipal AuthPrincipal principal,
            @Valid @RequestBody PostUpdateRequest request
    ) {
        return postService.updatePost(postId, principal.accountId(), request);
    }

    /**
     * DELETE /api/posts/{postId}
     *
     * Permanently delete a post owned by the authenticated user.
     * All child rows (PostBoss, PostBossCharacter, PostRating) are removed via cascade.
     *
     * Returns 204 No Content on success.
     * Returns 404 if the post does not exist.
     * Returns 400 if the authenticated user does not own the post.
     */
    @DeleteMapping("/{postId}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void deletePost(
            @PathVariable Integer postId,
            @AuthenticationPrincipal AuthPrincipal principal
    ) {
        postService.deletePost(postId, principal.accountId());
    }
}
