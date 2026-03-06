package com.stygianMaxxer.service;

import com.stygianMaxxer.dto.*;
import com.stygianMaxxer.model.*;
import com.stygianMaxxer.model.Character;
import com.stygianMaxxer.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class PostServiceImpl implements PostService {

    private final PostRepository postRepository;
    private final AccountRepository accountRepository;
    private final StygianRepository stygianRepository;
    private final BossRepository bossRepository;
    private final CharacterRepository characterRepository;
    private final PostRatingRepository postRatingRepository;

    /*
        COMMAND — Create aggregate
     */
    @Override
    @Transactional
    public PostResponse createPost(PostCreateRequest request) {

        Account account = accountRepository.findById(request.accountId())
                .orElseThrow();

        Stygian stygian = stygianRepository.findById(request.stygianId())
                .orElseThrow();

        Post post = Post.builder()
                .account(account)
                .stygian(stygian)
                .postTitle(request.title())
                .postDesc(request.description())
                .videoLink(request.videoLink())
                .createdAt(java.time.OffsetDateTime.now())
                .updatedAt(java.time.OffsetDateTime.now())
                .build();

        /*
            Build nested structure
         */
        request.bosses().forEach(bossReq -> {

            Boss boss = bossRepository.findById(bossReq.bossId())
                    .orElseThrow();

            PostBoss postBoss = PostBoss.builder()
                    .boss(boss)
                    .buildInfo(bossReq.buildInfo())
                    .build();

            bossReq.characters().forEach(charReq -> {

                Character character = characterRepository.findById(charReq.charId())
                        .orElseThrow();

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

        Post saved = postRepository.save(post);

        return PostMapper.toResponse(saved);
    }

    /*
        QUERY
     */
    @Override
    @Transactional(readOnly = true)
    public PostResponse getPost(Integer postId) {

        Post post = postRepository.findWithGraphByPostId(postId)
                .orElseThrow();

        return PostMapper.toResponse(post);
    }

    @Override
    @Transactional(readOnly = true)
    public Page<PostSummaryResponse> getPosts(Pageable pageable) {
        return postRepository.findPostSummaries(pageable);
    }

    @Override
    @Transactional
    public void ratePost(Integer postId, PostRateRequest request) {
        // Guard in service layer as an extra safety net
        short value = request.rating();
        if (value < 1 || value > 5) {
            throw new IllegalArgumentException("Rating must be between 1 and 5");
        }

        PostRatingId id = new PostRatingId(postId, request.accountId());
        PostRating postRating = postRatingRepository.findById(id).orElse(null);

        if (postRating == null) {
            Post post = postRepository.findById(postId).orElseThrow();
            Account account = accountRepository.findById(request.accountId()).orElseThrow();

            postRating = PostRating.builder()
                    .id(id)
                    .post(post)
                    .account(account)
                    .rating(value)
                    .build();
        } else {
            postRating.setRating(value);
        }

        postRatingRepository.save(postRating);
    }

    @Override
    @Transactional(readOnly = true)
    public RatingSummaryResponse getRatingSummary(Integer postId) {
        return postRatingRepository.getSummaryByPostId(postId);
    }
}