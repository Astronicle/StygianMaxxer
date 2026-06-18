package com.stygianMaxxer.dto;

import com.stygianMaxxer.model.Account;
import com.stygianMaxxer.model.Boss;
import com.stygianMaxxer.model.Character;
import com.stygianMaxxer.model.Post;
import com.stygianMaxxer.model.PostBoss;
import com.stygianMaxxer.model.PostBossCharacter;
import com.stygianMaxxer.model.Stygian;

import java.util.List;

public final class PostMapper {

    private PostMapper() {}

    public static PostResponse toResponse(Post post) {
        if (post == null) return null;

        Account account = post.getAccount();
        Stygian stygian = post.getStygian();

        AccountSummary accountSummary = account == null
                ? null
                : new AccountSummary(account.getAccountId(), account.getUsername());

        StygianSummary stygianSummary = stygian == null
                ? null
                : new StygianSummary(stygian.getId(), stygian.getName(), stygian.getVersion());

        List<PostBossResponse> bossResponses = post.getBosses() == null
                ? List.of()
                : post.getBosses().stream().map(PostMapper::toBossResponse).toList();

        return new PostResponse(
                post.getPostId(),
                post.getPostTitle(),
                post.getPostDesc(),
                post.getVideoLink(),
                post.getCreatedAt(),
                post.getUpdatedAt(),
                accountSummary,
                stygianSummary,
                bossResponses
        );
    }

    private static PostBossResponse toBossResponse(PostBoss postBoss) {
        if (postBoss == null) return null;

        Boss boss = postBoss.getBoss();
        Short  bossId   = boss != null ? boss.getId()   : null;
        String bossSlug = boss != null ? boss.getSlug() : null;
        String bossName = boss != null ? boss.getName() : null;

        List<PostBossCharacterResponse> characters = postBoss.getCharacters() == null
                ? List.of()
                : postBoss.getCharacters().stream().map(PostMapper::toBossCharacterResponse).toList();

        return new PostBossResponse(
                bossId,
                bossSlug,
                bossName,
                postBoss.getBuildInfo(),
                characters
        );
    }

    private static PostBossCharacterResponse toBossCharacterResponse(PostBossCharacter pbc) {
        if (pbc == null) return null;

        Character character = pbc.getCharacter();
        Short  charId   = character != null ? character.getId()   : null;
        String charName = character != null ? character.getName() : null;
        String charSlug = character != null ? character.getSlug() : null;

        return new PostBossCharacterResponse(
                charId,
                charName,
                charSlug,
                pbc.getSlot(),
                pbc.isHasSig(),
                pbc.getCons()
        );
    }
}
