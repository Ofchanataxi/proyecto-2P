package com.farmacia.auth.service;

import com.farmacia.auth.dto.AuthResponse;
import com.farmacia.auth.dto.LoginRequest;
import com.farmacia.auth.dto.RegisterRequest;
import com.farmacia.auth.entity.Usuario;
import com.farmacia.auth.repository.UsuarioRepository;
import com.farmacia.auth.security.JwtUtil;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

@Service
public class AuthService {

    @Autowired
    private UsuarioRepository usuarioRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @Autowired
    private JwtUtil jwtUtil;

    public AuthResponse register(RegisterRequest request) {
        // Verificar si el usuario ya existe
        if (usuarioRepository.existsByUsername(request.getUsername())) {
            throw new RuntimeException("El username ya está en uso");
        }

        if (usuarioRepository.existsByEmail(request.getEmail())) {
            throw new RuntimeException("El email ya está en uso");
        }

        // Crear nuevo usuario
        Usuario usuario = new Usuario();
        usuario.setUsername(request.getUsername());
        usuario.setEmail(request.getEmail());
        usuario.setPassword(passwordEncoder.encode(request.getPassword()));
        usuario.setRol(request.getRol());
        usuario.setActivo(true);

        usuarioRepository.save(usuario);

        // Generar token
        String token = jwtUtil.generateToken(usuario.getUsername(), usuario.getRol().name());

        return new AuthResponse(
                token,
                usuario.getUsername(),
                usuario.getEmail(),
                usuario.getRol().name());
    }

    public AuthResponse login(LoginRequest request) {
        // Buscar usuario
        Usuario usuario = usuarioRepository.findByUsername(request.getUsername())
                .orElseThrow(() -> new RuntimeException("Credenciales inválidas"));

        // Verificar contraseña
        if (!passwordEncoder.matches(request.getPassword(), usuario.getPassword())) {
            throw new RuntimeException("Credenciales inválidas");
        }

        // Verificar que el usuario esté activo
        if (!usuario.getActivo()) {
            throw new RuntimeException("Usuario inactivo");
        }

        // Generar token
        String token = jwtUtil.generateToken(usuario.getUsername(), usuario.getRol().name());

        return new AuthResponse(
                token,
                usuario.getUsername(),
                usuario.getEmail(),
                usuario.getRol().name());
    }

    public boolean validateToken(String token, String username) {
        return jwtUtil.validateToken(token, username);
    }

    public String extractUsername(String token) {
        return jwtUtil.extractUsername(token);
    }

    public String extractRol(String token) {
        return jwtUtil.extractRol(token);
    }

    public String encodePassword(String password) {
        return passwordEncoder.encode(password);
    }
}
