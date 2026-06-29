package com.stygianMaxxer.service;

import com.stygianMaxxer.dto.AuthResponse;
import com.stygianMaxxer.dto.LoginRequest;
import com.stygianMaxxer.dto.RegisterRequest;
import com.stygianMaxxer.model.Account;
import com.stygianMaxxer.model.Character;
import com.stygianMaxxer.repository.AccountRepository;
import com.stygianMaxxer.repository.CharacterRepository;
import com.stygianMaxxer.security.JwtService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.mockito.junit.jupiter.MockitoSettings;
import org.mockito.quality.Strictness;
import org.springframework.security.crypto.password.PasswordEncoder;

import java.util.Optional;

import static org.assertj.core.api.Assertions.*;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
@MockitoSettings(strictness = Strictness.LENIENT)
class AuthServiceTest {

    @Mock AccountRepository accountRepository;
    @Mock CharacterRepository characterRepository;
    @Mock PasswordEncoder passwordEncoder;
    @Mock JwtService jwtService;

    @InjectMocks AuthService authService;

    private RegisterRequest registerRequest;
    private Account savedAccount;

    @BeforeEach
    void setUp() {
        registerRequest = new RegisterRequest("testuser", "test@example.com", "password123");
        savedAccount = Account.builder()
                .accountId(1)
                .username("testuser")
                .email("test@example.com")
                .passwordHash("hashed")
                .build();

        // Default-avatar lookup runs on every register() call — stub it here
        // so individual tests don't need to repeat it. Lenient since not
        // every test path reaches register().
        when(characterRepository.findBySlug("traveler-anemo")).thenReturn(Optional.empty());
    }

    // ── register ──────────────────────────────────────────────────────────────

    @Test
    void register_success_returnsToken() {
        when(accountRepository.existsByUsername("testuser")).thenReturn(false);
        when(accountRepository.existsByEmail("test@example.com")).thenReturn(false);
        when(passwordEncoder.encode("password123")).thenReturn("hashed");
        when(accountRepository.save(any(Account.class))).thenReturn(savedAccount);
        when(jwtService.generateToken(1, "testuser")).thenReturn("jwt-token");

        AuthResponse response = authService.register(registerRequest);

        assertThat(response.token()).isEqualTo("jwt-token");
        assertThat(response.type()).isEqualTo("Bearer");
    }

    @Test
    void register_duplicateUsername_throwsIllegalArgument() {
        when(accountRepository.existsByUsername("testuser")).thenReturn(true);

        assertThatThrownBy(() -> authService.register(registerRequest))
                .isInstanceOf(IllegalArgumentException.class)
                .hasMessageContaining("Username already taken");

        verify(accountRepository, never()).save(any());
    }

    @Test
    void register_duplicateEmail_throwsIllegalArgument() {
        when(accountRepository.existsByUsername("testuser")).thenReturn(false);
        when(accountRepository.existsByEmail("test@example.com")).thenReturn(true);

        assertThatThrownBy(() -> authService.register(registerRequest))
                .isInstanceOf(IllegalArgumentException.class)
                .hasMessageContaining("Email already taken");

        verify(accountRepository, never()).save(any());
    }

    // ── login ─────────────────────────────────────────────────────────────────

    @Test
    void login_withUsername_success() {
        LoginRequest req = new LoginRequest("testuser", "password123");

        when(accountRepository.findByUsername("testuser")).thenReturn(Optional.of(savedAccount));
        when(passwordEncoder.matches("password123", "hashed")).thenReturn(true);
        when(jwtService.generateToken(1, "testuser")).thenReturn("jwt-token");

        AuthResponse response = authService.login(req);

        assertThat(response.token()).isEqualTo("jwt-token");
    }

    @Test
    void login_withEmail_success() {
        LoginRequest req = new LoginRequest("test@example.com", "password123");

        when(accountRepository.findByUsername("test@example.com")).thenReturn(Optional.empty());
        when(accountRepository.findByEmail("test@example.com")).thenReturn(Optional.of(savedAccount));
        when(passwordEncoder.matches("password123", "hashed")).thenReturn(true);
        when(jwtService.generateToken(1, "testuser")).thenReturn("jwt-token");

        AuthResponse response = authService.login(req);

        assertThat(response.token()).isEqualTo("jwt-token");
    }

    @Test
    void login_wrongPassword_throwsIllegalArgument() {
        LoginRequest req = new LoginRequest("testuser", "wrongpassword");

        when(accountRepository.findByUsername("testuser")).thenReturn(Optional.of(savedAccount));
        when(passwordEncoder.matches("wrongpassword", "hashed")).thenReturn(false);

        assertThatThrownBy(() -> authService.login(req))
                .isInstanceOf(IllegalArgumentException.class)
                .hasMessageContaining("Invalid credentials");
    }

    @Test
    void login_unknownUser_throwsIllegalArgument() {
        LoginRequest req = new LoginRequest("nobody", "password123");

        when(accountRepository.findByUsername("nobody")).thenReturn(Optional.empty());
        when(accountRepository.findByEmail("nobody")).thenReturn(Optional.empty());

        assertThatThrownBy(() -> authService.login(req))
                .isInstanceOf(IllegalArgumentException.class)
                .hasMessageContaining("Invalid credentials");
    }
}
