package ec.edu.espe.oauthserver.repository;

import ec.edu.espe.oauthserver.models.entities.Usuario;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.Optional;

public interface UsuarioRepository extends JpaRepository<Usuario, Long> {
    Optional<Usuario> findByUsername(String username);
}