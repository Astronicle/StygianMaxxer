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
    SecurityFilterChain securityFilterChain(HttpSecurity http, JwtAuthFilter jwtAuthFilter, RateLimitFilter rateLimitFilter) throws Exception {
        return http
                .csrf(csrf -> csrf.disable())
                .cors(Customizer.withDefaults())
                .sessionManagement(sm -> sm.sessionCreationPolicy(SessionCreationPolicy.STATELESS))
                .authorizeHttpRequests(auth -> auth

                        // ── Auth (exact paths, not wildcard) ─────────────────
                        .requestMatchers("/auth/register", "/auth/login").permitAll()

                        // ── Public read-only ──────────────────────────────────
                        // Anyone can browse posts, stygians, and lookup data
                        // (declared before the wildcard below — Spring Security
                        // takes the first matching rule)
                        .requestMatchers(HttpMethod.GET, "/api/posts/*/my-rating").authenticated()
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

                        // ── Same public endpoints, but for HEAD ───────────────
                        // Spring Security matches GET and HEAD separately — it
                        // does NOT infer HEAD permission from a GET rule, even
                        // though Spring MVC auto-handles HEAD for any @GetMapping.
                        // Needed for uptime monitors (e.g. UptimeRobot) that
                        // probe with HEAD instead of GET.
                        .requestMatchers(HttpMethod.HEAD, "/api/posts/**").permitAll()
                        .requestMatchers(HttpMethod.HEAD, "/api/stygian/**").permitAll()
                        .requestMatchers(HttpMethod.HEAD, "/api/elements/**").permitAll()
                        .requestMatchers(HttpMethod.HEAD, "/api/wep-types/**").permitAll()
                        .requestMatchers(HttpMethod.HEAD, "/api/characters/**").permitAll()
                        .requestMatchers(HttpMethod.HEAD, "/api/bosses/**").permitAll()
                        .requestMatchers(HttpMethod.HEAD, "/api/accounts").permitAll()
                        .requestMatchers(HttpMethod.HEAD, "/api/accounts/by-username/**").permitAll()
                        .requestMatchers(HttpMethod.HEAD, "/api/accounts/{accountId}").permitAll()

                        // ── Everything else requires a valid JWT ──────────────
                        // POST /api/posts, PATCH /api/posts/{id}, DELETE /api/posts/{id}
                        // POST /api/posts/{id}/rate
                        // GET+PATCH /api/accounts/me
                        .anyRequest().authenticated()
                )
                .addFilterBefore(rateLimitFilter, UsernamePasswordAuthenticationFilter.class)
                .addFilterBefore(jwtAuthFilter, UsernamePasswordAuthenticationFilter.class)
                .build();
    }
}
