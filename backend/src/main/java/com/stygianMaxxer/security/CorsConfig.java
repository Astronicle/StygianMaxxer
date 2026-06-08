package com.stygianMaxxer.security;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;

import java.util.List;

@Configuration
public class CorsConfig {

    /**
     * Spring Security picks this bean up automatically when you call
     * cors(Customizer.withDefaults()) in SecurityConfig.
     *
     * Allowed origins are intentionally strict — update the list to match
     * wherever your frontend is actually hosted (local dev + prod URL).
     */
    @Bean
    public CorsConfigurationSource corsConfigurationSource() {
        CorsConfiguration config = new CorsConfiguration();

        // ── Origins ──────────────────────────────────────────────────────────
        // Add your prod frontend URL here. Never use "*" in production when
        // allowCredentials is true — browsers will block it.
        config.setAllowedOrigins(List.of(
                "http://localhost:3000",   // local dev (e.g. React/Next)
                "http://localhost:5173"    // local dev (e.g. Vite)
                // "https://yourapp.com"  // <-- add prod URL here
        ));

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
