package ec.edu.espe.oauthserver.config;

import ec.edu.espe.oauthserver.models.entities.Usuario;
import ec.edu.espe.oauthserver.repository.UsuarioRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class DataInitializer {

    private static final Logger log = LoggerFactory.getLogger(DataInitializer.class);

    @Bean
    CommandLineRunner initDatabase(UsuarioRepository usuarioRepository) {
        return args -> {
            // Crear usuario admin si no existe
            if (usuarioRepository.findByUsername("admin").isEmpty()) {
                Usuario admin = new Usuario("admin", "{noop}admin123", "ADMIN");
                admin.setEnabled(true);
                usuarioRepository.save(admin);
                log.info("✅ Usuario ADMIN creado: admin / admin123");
            } else {
                log.info("ℹ️ Usuario admin ya existe");
            }

            // Crear usuario normal si no existe
            if (usuarioRepository.findByUsername("usuario").isEmpty()) {
                Usuario user = new Usuario("usuario", "{noop}user123", "USER");
                user.setEnabled(true);
                usuarioRepository.save(user);
                log.info("✅ Usuario USER creado: usuario / user123");
            } else {
                log.info("ℹ️ Usuario 'usuario' ya existe");
            }

            log.info("📊 Total usuarios en BD: " + usuarioRepository.count());
        };
    }
}
