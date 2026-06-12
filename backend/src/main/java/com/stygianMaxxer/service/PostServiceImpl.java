package com.stygianMaxxer.service;

import com.stygianMaxxer.dto.*;
import com.stygianMaxxer.model.*;
import com.stygianMaxxer.model.Character;
import com.stygianMaxxer.repository.*;
import com.stygianMaxxer.repository.StygianBossRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.OffsetDateTime;
import java.util.NoSuchElementException;

@Service
@RequiredArgsConstructor
public class PostServiceImpl implements PostService {

    private final PostRepository postRepository;
    private final AccountRepository accountRepository;
    private final StygianRepository stygianRepository;
    private final BossRepository bossRepository;
    private final StygianBossRepository stygianBossRepository;
    private final CharacterRepository characterRepository;
    private final PostRatingRepository postRatingRepository;

    // ── Create ────────────────────────────────────────────────────────────────

    @Override
    @Transactional
    public PostResponse createPost(Integer accountId, PostCreateRequest request) {

        Account account = accountRepository.findById(accountId)
                .orElseThrow(() -> new NoSuchElementException("Account not found: " + accountId));

        Stygian stygian = stygianRepository.findById(request.stygianId())
                .orElseThrow(() -> new NoSuchElementException("Stygian not found: " + request.stygianId()));

        Post post = Post.builder()
                .account(account)
                .stygian(stygian)
                .postTitle(request.title())
                .postDesc(request.description())
                .videoLink(request.videoLink())
                .createdAt(OffsetDateTime.now())
                .updatedAt(OffsetDateTime.now())
                .build();

        request.bosses().forEach(bossReq -> {

            Boss boss = bossRepository.findById(bossReq.bossId())
                    .orElseThrow(() -> new NoSuchElementException("Boss not found: " + bossReq.bossId()));

            // Ensure this boss actually belongs to the selected stygian
            if (!stygianBossRepository.existsByStygian_IdAndBoss_Id(stygian.getId(), boss.getId())) {
                throw new IllegalArgumentException(
                        "Boss '" + boss.getName() + "' does not belong to stygian '" + stygian.getName() + "'"
                );
            }

            PostBoss postBoss = PostBoss.builder()
                    .boss(boss)
                    .buildInfo(bossReq.buildInfo())
                    .build();

            bossReq.characters().forEach(charReq -> {

                Character character = characterRepository.findById(charReq.charId())
                        .orElseThrow(() -> new NoSuchElementException("Character not found: " + charReq.charId()));

                PostBossCharacter pbc = PostBossCharacter.builder()
                        .character(character)
                        .hasSig(charReq.hasSig())
                        .cons(charReq.cons())
                        .build();

                pbc.setSlot(charReq.slot());
                postBoss.addCharacter(pbc);
            });

            post.addBoss(postBoss);
        });

        return PostMapper.toResponse(postRepository.save(post));
    }

    // ── Read ──────────────────────────────────────────────────────────────────

    @Override
    @Transactional(readOnly = true)
    public PostResponse getPost(Integer postId) {
        Post post = postRepository.findWithGraphByPostId(postId)
                .orElseThrow(() -> new NoSuchElementException("Post not found: " + postId));

        return PostMapper.toResponse(post);
    }

    @Override
    @Transactional(readOnly = true)
    public Page<PostSummaryResponse> getPosts(
            Short stygianId,
            Integer accountId,
            Short bossId,
            Short charId,
            Pageable pageable
    ) {
        return postRepository.findPostSummaries(stygianId, accountId, bossId, charId, pageable);
    }

    // ── Update ────────────────────────────────────────────────────────────────

    @Override
    @Transactional
    public PostResponse updatePost(Integer postId, Integer accountId, PostUpdateRequest request) {

        Post post = postRepository.findWithGraphByPostId(postId)
                .orElseThrow(() -> new NoSuchElementException("Post not found: " + postId));

        // Only the author can edit their own post
        if (!post.getAccount().getAccountId().equals(accountId)) {
            throw new IllegalStateException("You do not have permission to edit this post");
        }

        // Only apply fields that were actually sent (null = don't touch)
        if (request.title() != null) {
            if (request.title().isBlank()) throw new IllegalArgumentException("Title must not be blank");
            post.setPostTitle(request.title());
        }
        if (request.description() != null) {
            if (request.description().isBlank()) throw new IllegalArgumentException("Description must not be blank");
            post.setPostDesc(request.description());
        }
        if (request.videoLink() != null) {
            if (request.videoLink().isBlank()) throw new IllegalArgumentException("Video link must not be blank");
            post.setVideoLink(request.videoLink());
        }

        post.setUpdatedAt(OffsetDateTime.now());

        return PostMapper.toResponse(postRepository.save(post));
    }

    // ── Delete ────────────────────────────────────────────────────────────────

    @Override
    @Transactional
    public void deletePost(Integer postId, Integer accountId) {

        Post post = postRepository.findById(postId)
                .orElseThrow(() -> new NoSuchElementException("Post not found: " + postId));

        // Only the author can delete their own post
        if (!post.getAccount().getAccountId().equals(accountId)) {
            throw new IllegalStateException("You do not have permission to delete this post");
        }

        postRepository.delete(post);
    }

    // ── Rate ──────────────────────────────────────────────────────────────────

    @Override
    @Transactional
    public void ratePost(Integer postId, Integer accountId, PostRateRequest request) {

        PostRatingId id = new PostRatingId(postId, accountId);
        PostRating postRating = postRatingRepository.findById(id).orElse(null);

        if (postRating == null) {
            Post post = postRepository.findById(postId)
                    .orElseThrow(() -> new NoSuchElementException("Post not found: " + postId));
            Account account = accountRepository.findById(accountId)
                    .orElseThrow(() -> new NoSuchElementException("Account not found: " + accountId));

            postRating = PostRating.builder()
                    .id(id)
                    .post(post)
                    .account(account)
                    .rating(request.rating())
                    .build();
        } else {
            postRating.setRating(request.rating());
        }

        postRatingRepository.save(postRating);
    }

    // ── Rating summary ────────────────────────────────────────────────────────

    @Override
    @Transactional(readOnly = true)
    public RatingSummaryResponse getRatingSummary(Integer postId) {
        return postRatingRepository.getSummaryByPostId(postId);
    }
}
