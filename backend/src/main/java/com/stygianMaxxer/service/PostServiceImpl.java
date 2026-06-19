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
import java.util.List;
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

            if (!stygianBossRepository.existsByStygian_IdAndBoss_Id(stygian.getId(), boss.getId())) {
                throw new IllegalArgumentException(
                        "Boss '" + boss.getName() + "' does not belong to stygian '" + stygian.getName() + "'"
                );
            }

            PostBoss postBoss = PostBoss.builder()
                    .boss(boss)
                    .buildInfo(bossReq.buildInfo())
                    .build();

            java.util.Set<Short> seenCharIds = new java.util.HashSet<>();

            bossReq.characters().forEach(charReq -> {

                if (!seenCharIds.add(charReq.charId())) {
                    throw new IllegalArgumentException(
                            "Duplicate character id " + charReq.charId() + " in the same boss team"
                    );
                }

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

        // Query 1: load Post + bosses (and their boss/account/stygian many-to-ones).
        // Only ONE bag (bosses) is joined here, so Hibernate is happy.
        Post post = postRepository.findPostWithBosses(postId)
                .orElseThrow(() -> new NoSuchElementException("Post not found: " + postId));

        // Collect the primary-key ids of every PostBoss that was just loaded.
        List<Long> bossIds = post.getBosses()
                .stream()
                .map(PostBoss::getPostBossId)
                .toList();

        if (!bossIds.isEmpty()) {
            // Query 2: load characters for ALL those bosses in one IN-clause query.
            // The result list is discarded here because Hibernate's first-level cache
            // (the session) already holds the PostBoss instances we loaded in Query 1.
            // Hibernate automatically wires the freshly loaded characters back into
            // the existing PostBoss objects in memory — no manual mapping needed.
            postRepository.findBossesWithCharacters(bossIds);
        }

        // At this point post.getBosses() is fully populated:
        // each PostBoss has its characters list filled in by the session cache.
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

        // updatePost also used findWithGraphByPostId before — same fix applied here.
        Post post = postRepository.findPostWithBosses(postId)
                .orElseThrow(() -> new NoSuchElementException("Post not found: " + postId));

        if (!post.getAccount().getAccountId().equals(accountId)) {
            throw new IllegalStateException("You do not have permission to edit this post");
        }

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

    // ── Bosses killed in a post ──────────────────────────────────────────────

    @Override
    @Transactional(readOnly = true)
    public List<BossResponse> getPostBosses(Integer postId) {
        return postRepository.findBossesForPost(postId)
                .stream()
                .map(boss -> new BossResponse(boss.getId(), boss.getSlug(), boss.getName()))
                .toList();
    }
}
