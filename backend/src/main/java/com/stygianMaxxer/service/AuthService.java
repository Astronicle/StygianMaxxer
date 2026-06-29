package com.stygianMaxxer.service;

import com.stygianMaxxer.dto.AuthResponse;
import com.stygianMaxxer.dto.LoginRequest;
import com.stygianMaxxer.dto.RegisterRequest;
import com.stygianMaxxer.model.Account;
import com.stygianMaxxer.repository.AccountRepository;
import com.stygianMaxxer.repository.CharacterRepository;
import com.stygianMaxxer.security.JwtService;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class AuthService {

    // New accounts get this character as their avatar until they pick one
    // of their own in the dashboard.
    private static final String DEFAULT_AVATAR_SLUG = "traveler-anemo";

    private final AccountRepository accountRepository;
    private final CharacterRepository characterRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtService jwtService;

    public AuthService(AccountRepository accountRepository,
                        CharacterRepository characterRepository,
                        PasswordEncoder passwordEncoder,
                        JwtService jwtService) {
        this.accountRepository = accountRepository;
        this.characterRepository = characterRepository;
        this.passwordEncoder = passwordEncoder;
        this.jwtService = jwtService;
    }

    @Transactional
    public AuthResponse register(RegisterRequest req) {
        if (accountRepository.existsByUsername(req.username())) {
            throw new IllegalArgumentException("Username already taken");
        }
        if (accountRepository.existsByEmail(req.email())) {
            throw new IllegalArgumentException("Email already taken");
        }

        Account account = Account.builder()
                .username(req.username())
                .email(req.email())
                .passwordHash(passwordEncoder.encode(req.password()))
                // Default avatar — Traveler. If it's missing from the lookup table
                // for some reason, just leave the avatar unset rather than fail
                // registration over it.
                .avatarCharacter(characterRepository.findBySlug(DEFAULT_AVATAR_SLUG).orElse(null))
                .build();

        Account saved = accountRepository.save(account);

        String jwt = jwtService.generateToken(saved.getAccountId(), saved.getUsername());
        return new AuthResponse(jwt, "Bearer");
    }

    @Transactional(readOnly = true)
    public AuthResponse login(LoginRequest req) {
        Account account = accountRepository.findByUsername(req.usernameOrEmail())
                .or(() -> accountRepository.findByEmail(req.usernameOrEmail()))
                .orElseThrow(() -> new IllegalArgumentException("Invalid credentials"));

        if (!passwordEncoder.matches(req.password(), account.getPasswordHash())) {
            throw new IllegalArgumentException("Invalid credentials");
        }

        String jwt = jwtService.generateToken(account.getAccountId(), account.getUsername());
        return new AuthResponse(jwt, "Bearer");
    }
}
