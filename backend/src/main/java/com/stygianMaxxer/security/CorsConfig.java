package com.stygianMaxxer.security;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;

import java.util.Arrays;
import java.util.List;

@Configuration
public class CorsConfig {

    /**
     * Spring Security picks this bean up automatically when you call
     * cors(Customizer.withDefaults()) in SecurityConfig.
     *
     * Allowed origins come from the ALLOWED_ORIGINS env var (comma-separated),
     * defaulting to local dev URLs only. Set this on Fly.io to your real
     * prod frontend URL — e.g.
     *   ALLOWED_ORIGINS=https://stygianmaxxer.com,http://localhost:3000
     */
    @Bean
    public CorsConfigurationSource corsConfigurationSource(
            @Value("${ALLOWED_ORIGINS:http://localhost:3000,http://localhost:5173}") String allowedOrigins
    ) {
        CorsConfiguration config = new CorsConfiguration();

        // ── Origins ──────────────────────────────────────────────────────────
        // Never use "*" in production when allowCredentials is true — browsers
        // will block it.
        List<String> origins = Arrays.stream(allowedOrigins.split(","))
                .map(String::trim)
                .filter(s -> !s.isBlank())
                .toList();
        config.setAllowedOrigins(origins);

        // ── Methods ───────────────────────────────────────────────────────────
        config.setAllowedMethods(List.of("GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"));

        // ── Headers ───────────────────────────────────────────────────────────
        // Authorization is required so the JWT Bearer token gets through.
        config.setAllowedHeaders(List.of("Authorization", "Content-Type", "Accept"));

        // ── Credentials ───────────────────────────────────────────────────────
        // Set to true if you ever use cookies or HTTP auth. Fine to keep true
        // for Authorization header based auth as well.
        config.setAllowCredentials(true);

        // ── Preflight cache ───────────────────────────────────────────────────
        // How long (seconds) browsers can cache the preflight response.
        config.setMaxAge(3600L);

        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        source.registerCorsConfiguration("/**", config);
        return source;
    }
}

