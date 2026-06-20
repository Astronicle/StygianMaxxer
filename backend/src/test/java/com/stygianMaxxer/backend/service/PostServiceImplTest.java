package com.stygianMaxxer.service;

import com.stygianMaxxer.dto.PostUpdateRequest;
import com.stygianMaxxer.model.Account;
import com.stygianMaxxer.model.Post;
import com.stygianMaxxer.repository.*;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.Collections;
import java.util.List;
import java.util.NoSuchElementException;
import java.util.Optional;

import static org.assertj.core.api.Assertions.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class PostServiceImplTest {

    @Mock PostRepository postRepository;
    @Mock AccountRepository accountRepository;
    @Mock StygianRepository stygianRepository;
    @Mock BossRepository bossRepository;
    @Mock StygianBossRepository stygianBossRepository;
    @Mock CharacterRepository characterRepository;
    @Mock WeaponRepository weaponRepository;
    @Mock ArtifactSetRepository artifactSetRepository;
    @Mock PostRatingRepository postRatingRepository;

    @InjectMocks PostServiceImpl postService;

    private Account owner;
    private Account otherUser;
    private Post post;

    @BeforeEach
    void setUp() {
        owner = Account.builder().accountId(1).username("owner").build();
        otherUser = Account.builder().accountId(2).username("other").build();

        post = Post.builder()
                .postId(10)
                .postTitle("Original title")
                .postDesc("Original desc")
                .videoLink("https://example.com/video")
                .account(owner)
                .build();
    }

    // ── getPost ───────────────────────────────────────────────────────────────

    @Test
    void getPost_notFound_throwsNoSuchElement() {
        when(postRepository.findPostWithBosses(99)).thenReturn(Optional.empty());

        assertThatThrownBy(() -> postService.getPost(99))
                .isInstanceOf(NoSuchElementException.class)
                .hasMessageContaining("Post not found: 99");
    }

    // ── updatePost ────────────────────────────────────────────────────────────

    @Test
    void updatePost_notOwner_throwsIllegalState() {
        when(postRepository.findPostWithBosses(10)).thenReturn(Optional.of(post));

        PostUpdateRequest req = new PostUpdateRequest("New title", null, null, null, null);

        assertThatThrownBy(() -> postService.updatePost(10, otherUser.getAccountId(), req))
                .isInstanceOf(IllegalStateException.class)
                .hasMessageContaining("permission");
    }

    @Test
    void updatePost_blankTitle_throwsIllegalArgument() {
        when(postRepository.findPostWithBosses(10)).thenReturn(Optional.of(post));

        PostUpdateRequest req = new PostUpdateRequest("   ", null, null, null ,null);

        assertThatThrownBy(() -> postService.updatePost(10, owner.getAccountId(), req))
                .isInstanceOf(IllegalArgumentException.class)
                .hasMessageContaining("Title must not be blank");
    }

    @Test
    void updatePost_nullFields_onlyChangesProvidedFields() {
        when(postRepository.findPostWithBosses(10)).thenReturn(Optional.of(post));
        when(postRepository.save(any())).thenAnswer(inv -> inv.getArgument(0));

        // Only update title, leave desc and videoLink null (don't touch)
        PostUpdateRequest req = new PostUpdateRequest("New title", null, null, null, null);

        postService.updatePost(10, owner.getAccountId(), req);

        assertThat(post.getPostTitle()).isEqualTo("New title");
        assertThat(post.getPostDesc()).isEqualTo("Original desc");
        assertThat(post.getVideoLink()).isEqualTo("https://example.com/video");
    }

    // ── deletePost ────────────────────────────────────────────────────────────

    @Test
    void deletePost_notOwner_throwsIllegalState() {
        when(postRepository.findById(10)).thenReturn(Optional.of(post));

        assertThatThrownBy(() -> postService.deletePost(10, otherUser.getAccountId()))
                .isInstanceOf(IllegalStateException.class)
                .hasMessageContaining("permission");
    }

    @Test
    void deletePost_owner_deletesSuccessfully() {
        when(postRepository.findById(10)).thenReturn(Optional.of(post));

        postService.deletePost(10, owner.getAccountId());

        verify(postRepository).delete(post);
    }

    @Test
    void deletePost_notFound_throwsNoSuchElement() {
        when(postRepository.findById(99)).thenReturn(Optional.empty());

        assertThatThrownBy(() -> postService.deletePost(99, owner.getAccountId()))
                .isInstanceOf(NoSuchElementException.class)
                .hasMessageContaining("Post not found: 99");
    }
}
