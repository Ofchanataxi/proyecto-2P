package ec.edu.espe.oauthserver.controller;

import ec.edu.espe.oauthserver.models.entities.Usuario;
import ec.edu.espe.oauthserver.repository.UsuarioRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/usuarios")
@CrossOrigin(origins = {"http://localhost:3000", "http://127.0.0.1:3000"})
public class UsuarioController {

    @Autowired
    private UsuarioRepository usuarioRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @GetMapping
    public List<Usuario> getAllUsuarios() {
        return usuarioRepository.findAll();
    }

    @GetMapping("/{id}")
    public ResponseEntity<Usuario> getUsuarioById(@PathVariable Long id) {
        return usuarioRepository.findById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @GetMapping("/buscar/{username}")
    public ResponseEntity<Usuario> getUsuarioByUsername(@PathVariable String username) {
        return usuarioRepository.findByUsername(username)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @PostMapping
    public Usuario createUsuario(@RequestBody Usuario usuario) {
        // Encriptar password si no tiene prefijo {noop} o similar
        if (!usuario.getPassword().startsWith("{")) {
            // Por defecto usamos {noop} para simplicidad en este entorno, o el encoder
            // configurado
            // Si el passwordEncoder es delegating, password() lo manejará
            usuario.setPassword("{noop}" + usuario.getPassword());
        }
        return usuarioRepository.save(usuario);
    }

    @PutMapping("/{id}")
    public ResponseEntity<Usuario> updateUsuario(@PathVariable Long id, @RequestBody Usuario usuarioDetails) {
        return usuarioRepository.findById(id)
                .map(usuario -> {
                    usuario.setUsername(usuarioDetails.getUsername());
                    usuario.setRole(usuarioDetails.getRole());
                    usuario.setEnabled(usuarioDetails.isEnabled());
                    if (usuarioDetails.getPassword() != null && !usuarioDetails.getPassword().isEmpty()) {
                        String pass = usuarioDetails.getPassword();
                        if (!pass.startsWith("{")) {
                            pass = "{noop}" + pass;
                        }
                        usuario.setPassword(pass);
                    }
                    return ResponseEntity.ok(usuarioRepository.save(usuario));
                })
                .orElse(ResponseEntity.notFound().build());
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteUsuario(@PathVariable Long id) {
        return usuarioRepository.findById(id)
                .map(usuario -> {
                    // Proteger al usuario admin principal
                    if ("admin".equalsIgnoreCase(usuario.getUsername())) {
                        return ResponseEntity.badRequest()
                                .body(java.util.Map.of("error", "No se puede eliminar al usuario administrador principal"));
                    }
                    usuarioRepository.deleteById(id);
                    return ResponseEntity.ok().build();
                })
                .orElse(ResponseEntity.notFound().build());
    }
}
