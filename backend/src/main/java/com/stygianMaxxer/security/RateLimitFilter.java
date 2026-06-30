package com.stygianMaxxer.security;

import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.data.redis.core.StringRedisTemplate;
import org.springframework.data.redis.core.script.DefaultRedisScript;
import org.springframework.http.MediaType;
import org.springframework.lang.NonNull;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;
import java.util.List;

/**
 * Redis-backed fixed-window rate limiter for the auth endpoints
 * (/auth/login, /auth/register). Keyed by client IP + endpoint.
 *
 * Uses a Lua script so the increment-and-check-expiry is atomic — a plain
 * INCR followed by a separate EXPIRE has a race window where concurrent
 * requests could each see a "first" increment and reset the TTL, letting
 * the window stay open indefinitely under load.
 *
 * Backed by Upstash Redis so limits hold across restarts and (if this ever
 * scales beyond one Fly.io instance) across multiple instances too.
 */
@Component
public class RateLimitFilter extends OncePerRequestFilter {

    private static final int LOGIN_LIMIT = 8;        // attempts per window
    private static final int REGISTER_LIMIT = 5;      // attempts per window
    private static final int WINDOW_SECONDS = 60;

    // KEYS[1] = redis key, ARGV[1] = window length in seconds
    // Returns the count after incrementing.
    private static final String SCRIPT = """
            local count = redis.call('INCR', KEYS[1])
            if count == 1 then
                redis.call('EXPIRE', KEYS[1], ARGV[1])
            end
            return count
            """;

    private final StringRedisTemplate redisTemplate;
    private final DefaultRedisScript<Long> rateLimitScript;

    public RateLimitFilter(StringRedisTemplate redisTemplate) {
        this.redisTemplate = redisTemplate;
        this.rateLimitScript = new DefaultRedisScript<>(SCRIPT, Long.class);
    }

    @Override
    protected void doFilterInternal(@NonNull HttpServletRequest request,
                                     @NonNull HttpServletResponse response,
                                     @NonNull FilterChain filterChain) throws ServletException, IOException {

        String path = request.getRequestURI();
        boolean isLogin = path.equals("/auth/login");
        boolean isRegister = path.equals("/auth/register");

        if (!isLogin && !isRegister) {
            filterChain.doFilter(request, response);
            return;
        }

        String ip = clientIp(request);
        String redisKey = "ratelimit:" + (isLogin ? "login:" : "register:") + ip;
        int limit = isLogin ? LOGIN_LIMIT : REGISTER_LIMIT;

        long count;
        try {
            Long result = redisTemplate.execute(
                    rateLimitScript,
                    List.of(redisKey),
                    String.valueOf(WINDOW_SECONDS)
            );
            count = result != null ? result : 0;
        } catch (Exception ex) {
            // Redis unreachable — fail open rather than locking everyone out
            // of login/register because Upstash is briefly unavailable.
            logger.warn("Rate limiter Redis call failed, allowing request through", ex);
            filterChain.doFilter(request, response);
            return;
        }

        if (count > limit) {
            response.setStatus(429);
            response.setContentType(MediaType.APPLICATION_JSON_VALUE);
            response.getWriter().write("""
                    {"status":429,"error":"Too Many Requests","message":"Too many attempts. Try again in a minute."}
                    """);
            return;
        }

        filterChain.doFilter(request, response);
    }

    private String clientIp(HttpServletRequest request) {
        // Fly.io sets this on requests forwarded to your app.
        String flyClientIp = request.getHeader("Fly-Client-IP");
        if (flyClientIp != null && !flyClientIp.isBlank()) return flyClientIp;

        // Fallback for other proxies / local dev.
        String xff = request.getHeader("X-Forwarded-For");
        if (xff != null && !xff.isBlank()) return xff.split(",")[0].trim();

        return request.getRemoteAddr();
    }
}
