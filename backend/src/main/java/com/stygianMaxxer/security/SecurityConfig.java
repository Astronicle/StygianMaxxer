package com.stygianMaxxer.security;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpMethod;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.config.Customizer;
import org.springframework.security.config.annotation.authentication.configuration.AuthenticationConfiguration;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.provisioning.InMemoryUserDetailsManager;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;

@Configuration
@EnableWebSecurity
public class SecurityConfig {

    @Bean
    PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }

    /**
     * Satisfies @ConditionalOnMissingBean(UserDetailsService.class) in
     * UserDetailsServiceAutoConfiguration, suppressing the generated-password warning.
     * This app uses JWT — username/password auth is never invoked.
     */
    @Bean
    UserDetailsService noOpUserDetailsService() {
        return new InMemoryUserDetailsManager(); // empty — no users
    }

    @Bean
    AuthenticationManager authenticationManager(AuthenticationConfiguration config) throws Exception {
        return config.getAuthenticationManager();
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
                        .requestMatchers(HttpMethod.GET, "/api/accounts").permitAll()
                        .requestMatchers(HttpMethod.GET, "/api/accounts/by-username/**").permitAll()
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
