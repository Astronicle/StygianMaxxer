package com.stygianMaxxer.controller;

import com.stygianMaxxer.dto.AuthResponse;
import com.stygianMaxxer.dto.LoginRequest;
import com.stygianMaxxer.dto.RegisterRequest;
import com.stygianMaxxer.service.AuthService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/auth")
public class AuthController {

    private final AuthService authService;

    public AuthController(AuthService authService) {
        this.authService = authService;
    }

    @PostMapping("/register")
    @ResponseStatus(HttpStatus.CREATED)   // 201 not 200 — a new resource was created
    public AuthResponse register(@RequestBody @Valid RegisterRequest req) {
        return authService.register(req);
    }

    @PostMapping("/login")
    public AuthResponse login(@RequestBody @Valid LoginRequest req) {
        return authService.login(req);
    }
}
