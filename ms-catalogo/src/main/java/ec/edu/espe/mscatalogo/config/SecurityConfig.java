package ec.edu.espe.mscatalogo.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpMethod;
import org.springframework.security.config.Customizer;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.web.SecurityFilterChain;

@Configuration
@EnableWebSecurity
public class SecurityConfig {

    @Bean
    public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {
        http
            .authorizeHttpRequests(auth -> auth
                .requestMatchers(HttpMethod.GET, "/api/medicamentos/**").hasAuthority("SCOPE_read")
                .requestMatchers(HttpMethod.POST, "/api/medicamentos/**").hasAuthority("SCOPE_write")
                .requestMatchers(HttpMethod.PUT, "/api/medicamentos/**").hasAuthority("SCOPE_write")
                .requestMatchers(HttpMethod.DELETE, "/api/medicamentos/**").hasAuthority("SCOPE_write")
                .anyRequest().authenticated()
            )
            .oauth2ResourceServer(oauth2 -> oauth2.jwt(Customizer.withDefaults()));
            
        return http.build();
    }
}