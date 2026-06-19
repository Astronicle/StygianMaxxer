package com.stygianMaxxer.controller;

import com.stygianMaxxer.dto.BossResponse;
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

import java.util.List;

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
    public Page<PostSummaryResponse> getPosts(
            @RequestParam(required = false) Short stygianId,
            @RequestParam(required = false) Integer accountId,
            @RequestParam(required = false) Short bossId,
            @RequestParam(required = false) Short charId,
            Pageable pageable
    ) {
        return postService.getPosts(stygianId, accountId, bossId, charId, pageable);
    }

    @PatchMapping("/{postId}")
    public PostResponse updatePost(
            @PathVariable Integer postId,
            @AuthenticationPrincipal AuthPrincipal principal,
            @RequestBody PostUpdateRequest request
    ) {
        return postService.updatePost(postId, principal.accountId(), request);
    }

    @DeleteMapping("/{postId}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void deletePost(
            @PathVariable Integer postId,
            @AuthenticationPrincipal AuthPrincipal principal
    ) {
        postService.deletePost(postId, principal.accountId());
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
     * GET /api/posts/{postId}/bosses
     * Lightweight list of bosses killed in this post (id, slug, name) — used
     * to render boss icons on post summary cards. Public.
     */
    @GetMapping("/{postId}/bosses")
    public List<BossResponse> getPostBosses(@PathVariable Integer postId) {
        return postService.getPostBosses(postId);
    }
}
