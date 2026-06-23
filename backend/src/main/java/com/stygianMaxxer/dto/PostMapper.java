package com.stygianMaxxer.dto;

import com.stygianMaxxer.model.Account;
import com.stygianMaxxer.model.ArtifactSet;
import com.stygianMaxxer.model.Boss;
import com.stygianMaxxer.model.Character;
import com.stygianMaxxer.model.Post;
import com.stygianMaxxer.model.PostBoss;
import com.stygianMaxxer.model.PostBossCharacter;
import com.stygianMaxxer.model.Stygian;
import com.stygianMaxxer.model.Weapon;
import com.stygianMaxxer.service.CostCalculator;

import java.math.BigDecimal;
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
                post.getDifficulty(),
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
                postBoss.getClearTime(),
                postBoss.getCost(),
                characters
        );
    }

    private static PostBossCharacterResponse toBossCharacterResponse(PostBossCharacter pbc) {
        if (pbc == null) return null;

        Character character = pbc.getCharacter();
        Short   charId      = character != null ? character.getId()      : null;
        String  charName    = character != null ? character.getName()    : null;
        String  charSlug    = character != null ? character.getSlug()    : null;
        short   charRarity  = character != null ? character.getRarity()  : 0;
        boolean charLimited = character != null && character.isLimited();
        BigDecimal characterCost = character != null
                ? CostCalculator.characterCost(character, pbc.getCons())
                : BigDecimal.ZERO;

        Weapon weapon = pbc.getWeapon();
        Short   weaponId       = weapon != null ? weapon.getId()      : null;
        String  weaponName     = weapon != null ? weapon.getName()    : null;
        String  weaponSlug     = weapon != null ? weapon.getSlug()    : null;
        short   weaponRarity   = weapon != null ? weapon.getRarity()  : 0;
        boolean weaponLimited  = weapon != null && weapon.isLimited();
        String  weaponTypeSlug = (weapon != null && weapon.getWeaponType() != null)
                ? weapon.getWeaponType().getSlug() : null;
        BigDecimal weaponCost = weapon != null
                ? CostCalculator.weaponCost(weapon, pbc.getRefinement())
                : BigDecimal.ZERO;

        ArtifactSet artifactSet = pbc.getArtifactSet();
        Short  artifactSetId   = artifactSet != null ? artifactSet.getId()   : null;
        String artifactSetName = artifactSet != null ? artifactSet.getName() : null;
        String artifactSetSlug = artifactSet != null ? artifactSet.getSlug() : null;

        return new PostBossCharacterResponse(
                charId,
                charName,
                charSlug,
                charRarity,
                charLimited,
                characterCost,
                weaponId,
                weaponName,
                weaponSlug,
                weaponRarity,
                weaponTypeSlug,
                weaponLimited,
                weaponCost,
                pbc.getRefinement(),
                artifactSetId,
                artifactSetName,
                artifactSetSlug,
                pbc.getSlot(),
                pbc.isHasSig(),
                pbc.getCons()
        );
    }
}
