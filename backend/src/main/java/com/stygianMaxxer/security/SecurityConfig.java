package com.stygianMaxxer.security;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpMethod;
import org.springframework.security.config.Customizer;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;

@Configuration
public class SecurityConfig {

    @Bean
    PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }

    @Bean
    SecurityFilterChain securityFilterChain(HttpSecurity http, JwtAuthFilter jwtAuthFilter) throws Exception {
        return http
                .csrf(csrf -> csrf.disable())
                .cors(Customizer.withDefaults())
                .sessionManagement(sm -> sm.sessionCreationPolicy(SessionCreationPolicy.STATELESS))
                .authorizeHttpRequests(auth -> auth

                        // ── Auth (exact paths, not wildcard) ─────────────────
                        .requestMatchers("/auth/register", "/auth/login").permitAll()

                        // ── Public read-only ──────────────────────────────────
                        // Anyone can browse posts, stygians, and lookup data
                        .requestMatchers(HttpMethod.GET, "/api/posts/**").permitAll()
                        .requestMatchers(HttpMethod.GET, "/api/stygian/**").permitAll()
                        .requestMatchers(HttpMethod.GET, "/api/elements/**").permitAll()
                        .requestMatchers(HttpMethod.GET, "/api/wep-types/**").permitAll()
                        .requestMatchers(HttpMethod.GET, "/api/characters/**").permitAll()
                        .requestMatchers(HttpMethod.GET, "/api/bosses/**").permitAll()
                        // Public account profile (not /me)
                        .requestMatchers(HttpMethod.GET, "/api/accounts/{accountId}").permitAll()

                        // ── Everything else requires a valid JWT ──────────────
                        // POST /api/posts, PATCH /api/posts/{id}, DELETE /api/posts/{id}
                        // POST /api/posts/{id}/rate
                        // GET+PATCH /api/accounts/me
                        .anyRequest().authenticated()
                )
                .addFilterBefore(jwtAuthFilter, UsernamePasswordAuthenticationFilter.class)
                .build();
    }
}
