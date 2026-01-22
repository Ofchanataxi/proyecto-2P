package com.farmacia.auth.controller;

import com.farmacia.auth.dto.AuthResponse;
import com.farmacia.auth.dto.LoginRequest;
import com.farmacia.auth.dto.RegisterRequest;
import com.farmacia.auth.service.AuthService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/auth")
public class AuthController {

    @Autowired
    private AuthService authService;

    @PostMapping("/register")
    public ResponseEntity<?> register(@Valid @RequestBody RegisterRequest request) {
        try {
            AuthResponse response = authService.register(request);
            return ResponseEntity.ok(response);
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest()
                    .body(Map.of("error", e.getMessage()));
        }
    }

    @PostMapping("/login")
    public ResponseEntity<?> login(@Valid @RequestBody LoginRequest request) {
        try {
            AuthResponse response = authService.login(request);
            return ResponseEntity.ok(response);
        } catch (RuntimeException e) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body(Map.of("error", e.getMessage()));
        }
    }

    @GetMapping("/validate")
    public ResponseEntity<?> validateToken(
            @RequestHeader("Authorization") String authHeader,
            @RequestParam String username) {
        try {
            String token = authHeader.substring(7); // Remove "Bearer " prefix
            boolean isValid = authService.validateToken(token, username);

            if (isValid) {
                String rol = authService.extractRol(token);
                return ResponseEntity.ok(Map.of(
                        "valid", true,
                        "username", username,
                        "rol", rol));
            } else {
                return ResponseEntity.ok(Map.of("valid", false));
            }
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body(Map.of("error", "Token inválido"));
        }
    }

    @GetMapping("/health")
    public ResponseEntity<Map<String, String>> health() {
        return ResponseEntity.ok(Map.of("status", "UP"));
    }

    // Endpoint temporal para generar hash BCrypt
    @GetMapping("/hash/{password}")
    public ResponseEntity<Map<String, String>> generateHash(@PathVariable String password) {
        return ResponseEntity.ok(Map.of(
                "password", password,
                "hash", authService.encodePassword(password)));
    }
}
