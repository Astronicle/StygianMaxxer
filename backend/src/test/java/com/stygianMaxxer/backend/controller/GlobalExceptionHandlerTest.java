package com.stygianMaxxer.controller;

import com.stygianMaxxer.security.CorsConfig;
import com.stygianMaxxer.security.JwtAuthFilter;
import com.stygianMaxxer.security.JwtService;
import com.stygianMaxxer.security.SecurityConfig;
import com.stygianMaxxer.service.PostService;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.context.annotation.Import;
import org.springframework.http.MediaType;
import org.springframework.security.test.context.support.WithMockUser;
import org.springframework.test.web.servlet.MockMvc;

import java.util.NoSuchElementException;

import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;
import static org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.csrf;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@WebMvcTest(controllers = PostController.class)
@Import({GlobalExceptionHandler.class, SecurityConfig.class, CorsConfig.class, JwtAuthFilter.class})
class GlobalExceptionHandlerTest {

    @Autowired MockMvc mockMvc;

    @MockBean PostService postService;
    @MockBean JwtService jwtService;   // needed by JwtAuthFilter

    // ── 404 from NoSuchElementException ──────────────────────────────────────

    @Test
    @WithMockUser  // bypasses JWT filter — we're testing exception mapping, not auth
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
    @WithMockUser
    void createPost_illegalArgument_returns400() throws Exception {
        when(postService.createPost(anyInt(), any()))
                .thenThrow(new IllegalArgumentException("Boss 'X' does not belong to stygian 'Y'"));

        mockMvc.perform(post("/api/posts")
                        .with(csrf())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                            {
                              "stygianId": 1,
                              "title": "test",
                              "description": "desc",
                              "videoLink": "https://example.com",
                              "bosses": [
                                {
                                  "bossId": 1,
                                  "buildInfo": "some info",
                                  "characters": [
                                    {"charId": 1, "slot": 1, "hasSig": false, "cons": 0}
                                  ]
                                }
                              ]
                            }
                        """))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.status").value(400))
                .andExpect(jsonPath("$.error").value("Bad request"))
                .andExpect(jsonPath("$.message").value("Boss 'X' does not belong to stygian 'Y'"));
    }

    // ── 409 from IllegalStateException ───────────────────────────────────────

    @Test
    @WithMockUser
    void updatePost_notOwner_returns409() throws Exception {
        when(postService.updatePost(anyInt(), anyInt(), any()))
                .thenThrow(new IllegalStateException("You do not have permission to edit this post"));

        mockMvc.perform(patch("/api/posts/1")
                        .with(csrf())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""{"title": "new title"}"""))
                .andExpect(status().isConflict())
                .andExpect(jsonPath("$.status").value(409))
                .andExpect(jsonPath("$.error").value("Conflict"))
                .andExpect(jsonPath("$.message").value("You do not have permission to edit this post"));
    }

    // ── 204 on successful delete ──────────────────────────────────────────────

    @Test
    @WithMockUser
    void deletePost_success_returns204() throws Exception {
        doNothing().when(postService).deletePost(anyInt(), anyInt());

        mockMvc.perform(delete("/api/posts/1").with(csrf()))
                .andExpect(status().isNoContent());
    }
}
