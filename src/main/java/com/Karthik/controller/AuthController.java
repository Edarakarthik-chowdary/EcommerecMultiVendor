package com.Karthik.controller;

import com.Karthik.payload.LoginRequest;
import com.Karthik.payload.RegisterRequest;
import com.Karthik.service.AuthService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;

@RestController
@RequestMapping("/auth")
public class AuthController {

    private final AuthService authService;

    public AuthController(AuthService authService) {
        this.authService = authService;
    }

    // Customer registration
    @PostMapping("/register")
    public ResponseEntity<?> register(
            @RequestBody RegisterRequest request) {

        return ResponseEntity
                .status(HttpStatus.CREATED)
                .body(authService.register(request));
    }

    // Customer or administrator login
    @PostMapping("/login")
    public ResponseEntity<?> login(
            @RequestBody LoginRequest request) {

        return ResponseEntity.ok(authService.login(request));
    }

    // Administrator-only setup placeholder.
    // The service implementation must be added before enabling this endpoint.
    @PostMapping("/admin/setup")
    public ResponseEntity<?> adminSetup(
            Authentication authentication) {

        if (authentication == null
                || !authentication.isAuthenticated()
                || authentication.getAuthorities().stream()
                .noneMatch(authority ->
                        "ROLE_ADMIN".equals(authority.getAuthority()))) {

            throw new ResponseStatusException(
                    HttpStatus.FORBIDDEN,
                    "Administrator access required"
            );
        }

        return ResponseEntity.ok(
                "Administrator authenticated. Setup service is not implemented yet."
        );
    }
}