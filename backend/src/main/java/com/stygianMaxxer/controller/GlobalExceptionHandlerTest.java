package com.stygianMaxxer.controller;

import com.stygianMaxxer.security.JwtAuthFilter;
import com.stygianMaxxer.security.SecurityConfig;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.context.annotation.Import;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;

import java.util.NoSuchElementException;

import static org.mockito.Mockito.*;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@WebMvcTest(controllers = PostController.class)
@Import(GlobalExceptionHandler.class)
class GlobalExceptionHandlerTest {

    @Autowired MockMvc mockMvc;

    @MockBean com.stygianMaxxer.service.PostService postService;

    // ── 404 from NoSuchElementException ───────────────────────────────────────

    @Test
    void getPost_notFound_returns404WithMessage() throws Exception {
        when(postService.getPost(999))
                .thenThrow(new NoSuchElementException("Post not found: 999"));

        mockMvc.perform(get("/api/posts/999"))
                .andExpect(status().isNotFound())
                .andExpect(jsonPath("$.status").value(404))
                .andExpect(jsonPath("$.error").value("Not found"))
                .andExpect(jsonPath("$.message").value("Post not found: 999"))
                .andExpect(jsonPath("$.timestamp").exists());
    }

    // ── 400 from IllegalArgumentException ────────────────────────────────────

    @Test
    void createPost_illegalArgument_returns400() throws Exception {
        when(postService.createPost(anyInt(), any()))
                .thenThrow(new IllegalArgumentException("Boss 'X' does not belong to stygian 'Y'"));

        mockMvc.perform(post("/api/posts")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                            {
                              "stygianId": 1,
                              "title": "test",
                              "description": "desc",
                              "videoLink": "https://example.com",
                              "bosses": []
                            }
                        """))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.status").value(400))
                .andExpect(jsonPath("$.error").value("Bad request"));
    }

    // ── 409 from IllegalStateException ────────────────────────────────────────

    @Test
    void updatePost_notOwner_returns409() throws Exception {
        when(postService.updatePost(anyInt(), anyInt(), any()))
                .thenThrow(new IllegalStateException("You do not have permission to edit this post"));

        mockMvc.perform(patch("/api/posts/1")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""{"title": "new title"}"""))
                .andExpect(status().isConflict())
                .andExpect(jsonPath("$.status").value(409))
                .andExpect(jsonPath("$.error").value("Conflict"));
    }
}
