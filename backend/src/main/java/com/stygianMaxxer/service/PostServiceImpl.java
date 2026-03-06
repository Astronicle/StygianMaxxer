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
}