package com.stygianMaxxer.service;

import com.stygianMaxxer.dto.*;
import com.stygianMaxxer.model.*;
import com.stygianMaxxer.model.Character;
import com.stygianMaxxer.repository.*;
import com.stygianMaxxer.repository.StygianBossRepository;
import jakarta.persistence.EntityManager;
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
    private final WeaponRepository weaponRepository;
    private final ArtifactSetRepository artifactSetRepository;
    private final PostRatingRepository postRatingRepository;
    private final EntityManager entityManager;

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
                .difficulty(request.difficulty())
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
                    .clearTime(bossReq.clearTime())
                    .build();

            java.util.Set<Short> seenCharIds = new java.util.HashSet<>();
            java.math.BigDecimal bossCost = java.math.BigDecimal.ZERO;

            for (var charReq : bossReq.characters()) {

                if (!seenCharIds.add(charReq.charId())) {
                    throw new IllegalArgumentException(
                            "Duplicate character id " + charReq.charId() + " in the same boss team"
                    );
                }

                Character character = characterRepository.findById(charReq.charId())
                        .orElseThrow(() -> new NoSuchElementException("Character not found: " + charReq.charId()));

                Weapon weapon = resolveWeaponForCharacter(character, charReq.weaponId());
                ArtifactSet artifactSet = artifactSetRepository.findById(charReq.artifactSetId())
                        .orElseThrow(() -> new NoSuchElementException("Artifact set not found: " + charReq.artifactSetId()));

                PostBossCharacter pbc = PostBossCharacter.builder()
                        .character(character)
                        .weapon(weapon)
                        .artifactSet(artifactSet)
                        .hasSig(charReq.hasSig())
                        .refinement(charReq.refinement())
                        .cons(charReq.cons())
                        .build();

                pbc.setSlot(charReq.slot());
                postBoss.addCharacter(pbc);

                bossCost = bossCost.add(
                        CostCalculator.characterSlotCost(character, charReq.cons(), weapon, charReq.refinement())
                );
            }

            postBoss.setCost(bossCost);

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
            Difficulty difficulty,
            java.math.BigDecimal minCost,
            java.math.BigDecimal maxCost,
            Integer minTime,
            Integer maxTime,
            List<Short> charInclude,
            String includeMode,
            List<Short> charExclude,
            Boolean allBossesOnly,
            Pageable pageable
    ) {
        Page<PostSummaryResponse> page = postRepository.findPostSummaries(
                stygianId, accountId, bossId, charId,
                difficulty, minCost, maxCost, minTime, maxTime,
                pageable
        );

        if (page.isEmpty()) {
            return page;
        }

        List<Integer> postIds = page.getContent().stream()
                .map(PostSummaryResponse::postId)
                .toList();

        // ── Batch-fetch character icons for every boss across this page ─────────
        java.util.Map<String, List<PostBossCharacterIcon>> charsByPostBoss = new java.util.LinkedHashMap<>();
        for (Object[] row : postRepository.findCharacterIconsForAllBossesInPosts(postIds)) {
            Integer postId = (Integer) row[0];
            Short   bId    = (Short)   row[1];
            Short   cId    = (Short)   row[2];
            String  cSlug  = (String)  row[3];
            String  cName  = (String)  row[4];

            String key = postId + ":" + bId;
            charsByPostBoss
                    .computeIfAbsent(key, k -> new java.util.ArrayList<>())
                    .add(new PostBossCharacterIcon(cId, cSlug, cName));
        }

        // ── Batch-fetch boss rows (clearTime, cost) for this page ───────────────
        java.util.Map<Integer, List<PostBossSummary>> bossesByPostId = new java.util.LinkedHashMap<>();
        for (Object[] row : postRepository.findBossSummariesForPosts(postIds)) {
            Integer              postId    = (Integer)              row[0];
            Short                bId       = (Short)                row[1];
            String               bSlug     = (String)               row[2];
            String               bName     = (String)               row[3];
            short                clearTime = (Short)                row[4];
            java.math.BigDecimal cost      = (java.math.BigDecimal) row[5];

            List<PostBossCharacterIcon> chars =
                    charsByPostBoss.getOrDefault(postId + ":" + bId, List.of());

            bossesByPostId
                    .computeIfAbsent(postId, k -> new java.util.ArrayList<>())
                    .add(new PostBossSummary(bId, bSlug, bName, clearTime, cost, chars));
        }

        page = page.map(summary ->
                summary.withBosses(bossesByPostId.getOrDefault(summary.postId(), List.of()))
        );

        // ── Service-layer post-filters (dynamic predicates) ─────────────────────
        boolean hasInclude = charInclude != null && !charInclude.isEmpty();
        boolean hasExclude = charExclude != null && !charExclude.isEmpty();
        boolean allBosses  = Boolean.TRUE.equals(allBossesOnly) && stygianId != null;

        if (hasInclude || hasExclude || allBosses) {
            // All char IDs used per post, across all bosses
            java.util.Map<Integer, java.util.Set<Short>> charIdsByPost = new java.util.HashMap<>();
            charsByPostBoss.forEach((key, chars) -> {
                int colon = key.indexOf(':');
                Integer postId = Integer.parseInt(key.substring(0, colon));
                chars.forEach(c -> charIdsByPost
                        .computeIfAbsent(postId, k -> new java.util.HashSet<>())
                        .add(c.charId()));
            });

            // Boss IDs present in each post
            java.util.Map<Integer, java.util.Set<Short>> bossIdsByPost = new java.util.HashMap<>();
            bossesByPostId.forEach((postId, bosses) -> {
                java.util.Set<Short> ids = new java.util.HashSet<>();
                bosses.forEach(b -> ids.add(b.bossId()));
                bossIdsByPost.put(postId, ids);
            });

            // Actual boss IDs required by this stygian for allBossesOnly
            final java.util.Set<Short> stygianBossIds = new java.util.HashSet<>();
            if (allBosses) {
                stygianBossIds.addAll(stygianBossRepository.findBossIdsByStygianId(stygianId));
            }

            java.util.List<PostSummaryResponse> filtered = new java.util.ArrayList<>();
            for (PostSummaryResponse summary : page.getContent()) {
                Integer postId    = summary.postId();
                java.util.Set<Short> postChars  = charIdsByPost.getOrDefault(postId, java.util.Set.of());
                java.util.Set<Short> postBosses = bossIdsByPost.getOrDefault(postId, java.util.Set.of());

                if (hasInclude) {
                    java.util.Set<Short> needed = new java.util.HashSet<>(charInclude);
                    boolean passes = "OR".equalsIgnoreCase(includeMode)
                            ? needed.stream().anyMatch(postChars::contains)
                            : postChars.containsAll(needed);
                    if (!passes) continue;
                }

                if (hasExclude) {
                    if (charExclude.stream().anyMatch(postChars::contains)) continue;
                }

                if (allBosses && !postBosses.containsAll(stygianBossIds)) {
                    continue;
                }

                filtered.add(summary);
            }

            page = new org.springframework.data.domain.PageImpl<>(
                    filtered,
                    pageable,
                    filtered.size() < pageable.getPageSize()
                            ? (long) pageable.getOffset() + filtered.size()
                            : page.getTotalElements()
            );
        }

        // bossClear: attach this-boss-only data when bossId filter is active
        if (bossId != null) {
            final java.util.Map<Integer, List<PostBossSummary>> finalBosses = bossesByPostId;
            page = page.map(summary -> {
                PostBossSummary thisBoss = finalBosses
                        .getOrDefault(summary.postId(), List.of())
                        .stream()
                        .filter(b -> bossId.equals(b.bossId()))
                        .findFirst()
                        .orElse(null);

                if (thisBoss == null) return summary;

                return summary.withBossClear(
                        new PostBossClearSummary(
                                thisBoss.clearTime(),
                                thisBoss.cost(),
                                thisBoss.characters()
                        )
                );
            });
        }

        return page;
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
        if (request.difficulty() != null) {
            post.setDifficulty(request.difficulty());
        }

        // ── Optional boss replacement ─────────────────────────────────────────
        // If the client sends a bosses list, fully replace the existing ones.
        // orphanRemoval = true on Post.bosses means clearing the list deletes
        // the old PostBoss (and their PostBossCharacter) rows automatically.
        if (request.bosses() != null) {
            post.getBosses().clear();
            entityManager.flush(); // ensure orphan-removal DELETEs run before new PostBoss INSERTs

            request.bosses().forEach(bossReq -> {

                Boss boss = bossRepository.findById(bossReq.bossId())
                        .orElseThrow(() -> new NoSuchElementException("Boss not found: " + bossReq.bossId()));

                if (!stygianBossRepository.existsByStygian_IdAndBoss_Id(post.getStygian().getId(), boss.getId())) {
                    throw new IllegalArgumentException(
                            "Boss '" + boss.getName() + "' does not belong to stygian '" + post.getStygian().getName() + "'"
                    );
                }

                PostBoss postBoss = PostBoss.builder()
                        .boss(boss)
                        .buildInfo(bossReq.buildInfo())
                        .clearTime(bossReq.clearTime())
                        .build();

                java.util.Set<Short> seenCharIds = new java.util.HashSet<>();
                java.math.BigDecimal bossCost = java.math.BigDecimal.ZERO;

                for (var charReq : bossReq.characters()) {

                    if (!seenCharIds.add(charReq.charId())) {
                        throw new IllegalArgumentException(
                                "Duplicate character id " + charReq.charId() + " in the same boss team"
                        );
                    }

                    Character character = characterRepository.findById(charReq.charId())
                            .orElseThrow(() -> new NoSuchElementException("Character not found: " + charReq.charId()));

                    Weapon weapon = resolveWeaponForCharacter(character, charReq.weaponId());
                    ArtifactSet artifactSet = artifactSetRepository.findById(charReq.artifactSetId())
                            .orElseThrow(() -> new NoSuchElementException("Artifact set not found: " + charReq.artifactSetId()));

                    PostBossCharacter pbc = PostBossCharacter.builder()
                            .character(character)
                            .weapon(weapon)
                            .artifactSet(artifactSet)
                            .hasSig(charReq.hasSig())
                            .refinement(charReq.refinement())
                            .cons(charReq.cons())
                            .build();

                    pbc.setSlot(charReq.slot());
                    postBoss.addCharacter(pbc);

                    bossCost = bossCost.add(
                            CostCalculator.characterSlotCost(character, charReq.cons(), weapon, charReq.refinement())
                    );
                }

                postBoss.setCost(bossCost);

                post.addBoss(postBoss);
            });
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

    // ── Weapon resolution / validation ───────────────────────────────────────
    // A character may only be equipped with a weapon matching their weapon type
    // (e.g. a sword-user can only equip swords).

    private Weapon resolveWeaponForCharacter(Character character, Short weaponId) {
        Weapon weapon = weaponRepository.findById(weaponId)
                .orElseThrow(() -> new NoSuchElementException("Weapon not found: " + weaponId));

        short charWeaponTypeId = character.getWeaponType().getId();
        short weaponTypeId = weapon.getWeaponType().getId();

        if (charWeaponTypeId != weaponTypeId) {
            throw new IllegalArgumentException(
                    "Weapon '" + weapon.getName() + "' (" + weapon.getWeaponType().getName() +
                    ") cannot be equipped by '" + character.getName() + "' (" +
                    character.getWeaponType().getName() + ")"
            );
        }

        return weapon;
    }
}
