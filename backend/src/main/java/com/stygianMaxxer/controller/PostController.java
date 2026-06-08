package com.stygianMaxxer.controller;

import com.stygianMaxxer.dto.PostCreateRequest;
import com.stygianMaxxer.dto.PostRateRequest;
import com.stygianMaxxer.dto.PostResponse;
import com.stygianMaxxer.dto.PostSummaryResponse;
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
}
