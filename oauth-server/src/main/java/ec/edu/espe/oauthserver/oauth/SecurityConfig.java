package ec.edu.espe.oauthserver.oauth;

import com.nimbusds.jose.jwk.JWKSet;
import com.nimbusds.jose.jwk.RSAKey;
import com.nimbusds.jose.jwk.source.ImmutableJWKSet;
import com.nimbusds.jose.jwk.source.JWKSource;
import com.nimbusds.jose.proc.SecurityContext;
import ec.edu.espe.oauthserver.repository.UsuarioRepository;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.core.annotation.Order;
import org.springframework.http.MediaType;
import org.springframework.security.config.Customizer;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.core.userdetails.User;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.security.crypto.factory.PasswordEncoderFactories;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.oauth2.core.AuthorizationGrantType;
import org.springframework.security.oauth2.core.ClientAuthenticationMethod;
import org.springframework.security.oauth2.core.oidc.OidcScopes;
import org.springframework.security.oauth2.jwt.JwtDecoder;
import org.springframework.security.oauth2.jwt.NimbusJwtDecoder;
import org.springframework.security.oauth2.server.authorization.client.InMemoryRegisteredClientRepository;
import org.springframework.security.oauth2.server.authorization.client.RegisteredClient;
import org.springframework.security.oauth2.server.authorization.client.RegisteredClientRepository;
import org.springframework.security.oauth2.server.authorization.config.annotation.web.configuration.OAuth2AuthorizationServerConfiguration;
import org.springframework.security.oauth2.server.authorization.config.annotation.web.configurers.OAuth2AuthorizationServerConfigurer;
import org.springframework.security.oauth2.server.authorization.settings.AuthorizationServerSettings;
import org.springframework.security.oauth2.server.authorization.settings.ClientSettings;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.LoginUrlAuthenticationEntryPoint;
import org.springframework.security.web.util.matcher.MediaTypeRequestMatcher;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;

import java.security.KeyPair;
import java.security.KeyPairGenerator;
import java.security.interfaces.RSAPrivateKey;
import java.security.interfaces.RSAPublicKey;
import java.util.Arrays;
import java.util.UUID;

@Configuration
@EnableWebSecurity
public class SecurityConfig {

        // 1. GESTOR DE USUARIOS DESDE BASE DE DATOS
        @Bean
        public UserDetailsService userDetailsService(UsuarioRepository usuarioRepository) {
                return username -> usuarioRepository.findByUsername(username)
                                .map(usuario -> User.withUsername(usuario.getUsername())
                                                // La contraseña en DB debe tener prefijo, ej: {noop}12345 o
                                                // {bcrypt}$2a$10...
                                                .password(usuario.getPassword())
                                                .roles(usuario.getRole())
                                                .disabled(!usuario.isEnabled())
                                                .build())
                                .orElseThrow(() -> new UsernameNotFoundException("Usuario no encontrado: " + username));
        }

        // Codificador de contraseñas inteligente (Soporta {noop}, {bcrypt}, etc.)
        @Bean
        public PasswordEncoder passwordEncoder() {
                return PasswordEncoderFactories.createDelegatingPasswordEncoder();
        }

        // 2. CONFIGURACIÓN CORS (FRONTEND REACT)
        @Bean
        public CorsConfigurationSource corsConfigurationSource() {
                CorsConfiguration configuration = new CorsConfiguration();
                configuration.setAllowedOrigins(Arrays.asList(
        "http://localhost:3000",
        "http://127.0.0.1:3000",
        "http://34.130.207.184:3000"
));
                configuration.setAllowedMethods(Arrays.asList("GET", "POST", "PUT", "DELETE", "OPTIONS"));
                configuration.setAllowedHeaders(Arrays.asList("*"));
                configuration.setAllowCredentials(true);
                configuration.setMaxAge(3600L); // Cache preflight por 1 hora

                UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
                source.registerCorsConfiguration("/**", configuration);
                return source;
        }

        @Bean
        @Order(1)
        public SecurityFilterChain authorizationServerSecurityFilterChain(HttpSecurity http) throws Exception {
                OAuth2AuthorizationServerConfiguration.applyDefaultSecurity(http);
                http.getConfigurer(OAuth2AuthorizationServerConfigurer.class)
                                .oidc(Customizer.withDefaults()); // Enable OpenID Connect 1.0

                http.exceptionHandling((exceptions) -> exceptions
                                .defaultAuthenticationEntryPointFor(
                                                new LoginUrlAuthenticationEntryPoint("/login"),
                                                new MediaTypeRequestMatcher(MediaType.TEXT_HTML)))
                                .oauth2ResourceServer((resourceServer) -> resourceServer
                                                .jwt(Customizer.withDefaults()));

                // ACTIVAR CORS AQUÍ TAMBIÉN
                http.cors(Customizer.withDefaults());

                return http.build();
        }

        // 3. SEGURIDAD PARA API REST DE USUARIOS (Resource Server con JWT)
        @Bean
        @Order(2)
        public SecurityFilterChain apiSecurityFilterChain(HttpSecurity http) throws Exception {
                http
                                .securityMatcher("/usuarios/**")
                                .authorizeHttpRequests((authorize) -> authorize
                                                .anyRequest().hasRole("ADMIN"))
                                .cors(Customizer.withDefaults())
                                .csrf(csrf -> csrf.disable())
                                .oauth2ResourceServer((resourceServer) -> resourceServer
                                                .jwt(jwt -> jwt.jwtAuthenticationConverter(jwtAuthenticationConverter())));

                return http.build();
        }

        // Converter para extraer roles del claim "roles" en el JWT
        private org.springframework.security.oauth2.server.resource.authentication.JwtAuthenticationConverter jwtAuthenticationConverter() {
                org.springframework.core.convert.converter.Converter<org.springframework.security.oauth2.jwt.Jwt, java.util.Collection<org.springframework.security.core.GrantedAuthority>> grantedAuthoritiesConverter = jwt -> {
                        java.util.Collection<String> roles = jwt.getClaimAsStringList("roles");
                        if (roles == null) {
                                return java.util.Collections.emptyList();
                        }
                        return roles.stream()
                                        .map(org.springframework.security.core.authority.SimpleGrantedAuthority::new)
                                        .collect(java.util.stream.Collectors.toList());
                };

                org.springframework.security.oauth2.server.resource.authentication.JwtAuthenticationConverter jwtConverter = new org.springframework.security.oauth2.server.resource.authentication.JwtAuthenticationConverter();
                jwtConverter.setJwtGrantedAuthoritiesConverter(grantedAuthoritiesConverter);
                return jwtConverter;
        }

        @Bean
        @Order(3)
        public SecurityFilterChain defaultSecurityFilterChain(HttpSecurity http) throws Exception {
                http
                                .authorizeHttpRequests((authorize) -> authorize
                                                // Permitir acceso a recursos estáticos sin autenticación
                                                .requestMatchers("/css/**", "/images/**", "/js/**", "/favicon.ico",
                                                                "/error")
						.permitAll()

						//Permitir endpoints OIDC/Oauth sin autenticación
						.requestMatchers(
  						  "/.well-known/**",
    						  "/oauth2/jwks",
    						  "/oauth2/token",
   						  "/oauth2/introspect",
   						  "/oauth2/revoke"
						).permitAll()
                                                .anyRequest().authenticated())
                                // ACTIVAR CORS AQUÍ
                                .cors(Customizer.withDefaults())
                                // Usar página de login personalizada
                                .formLogin(form -> form
                                                .loginPage("/login")
                                                .permitAll())
                                // Configuración de logout para destruir sesión completamente
                                .logout(logout -> logout
                                                .logoutRequestMatcher(
                                                                new org.springframework.security.web.util.matcher.AntPathRequestMatcher(
                                                                                "/logout", "GET"))
                                                .logoutSuccessUrl("http://34.130.207.184:3000")
                                                .invalidateHttpSession(true)
                                                .clearAuthentication(true)
                                                .deleteCookies("JSESSIONID")
                                                .permitAll());

                return http.build();
        }

        @Bean
        public RegisteredClientRepository registeredClientRepository() {
                RegisteredClient reactClient = RegisteredClient.withId(UUID.randomUUID().toString())
                                .clientId("farmacia-frontend")
                                .clientSecret("{noop}")
                                .clientAuthenticationMethod(ClientAuthenticationMethod.NONE)
                                .authorizationGrantType(AuthorizationGrantType.AUTHORIZATION_CODE)
                                .authorizationGrantType(AuthorizationGrantType.REFRESH_TOKEN)
                                // URIs de desarrollo
                                .redirectUri("http://localhost:3000")
                                .redirectUri("http://localhost:3000/")
                                .redirectUri("http://127.0.0.1:3000")
                                .redirectUri("http://127.0.0.1:3000/")
                                // URIs de producción (IP público)
                                .redirectUri("http://34.130.207.184:3000")
                                .redirectUri("http://34.130.207.184:3000/")
                                .postLogoutRedirectUri("http://localhost:3000")
                                .postLogoutRedirectUri("http://127.0.0.1:3000")
                                .postLogoutRedirectUri("http://34.130.207.184:3000")
                                .scope(OidcScopes.OPENID)
                                .scope(OidcScopes.PROFILE)
                                .scope("read")
                                .scope("write")
                                .clientSettings(ClientSettings.builder()
                                                .requireAuthorizationConsent(false)
                                                .requireProofKey(true)
                                                .build())
                                .build();

                return new InMemoryRegisteredClientRepository(reactClient);
        }

        @Bean
        public AuthorizationServerSettings authorizationServerSettings() {
                return AuthorizationServerSettings.builder()
                                .issuer("http://34.130.207.184:9000")
                                .build();
        }

        @Bean
        public JWKSource<SecurityContext> jwkSource() {
                KeyPair keyPair = generateRsaKey();
                RSAPublicKey publicKey = (RSAPublicKey) keyPair.getPublic();
                RSAPrivateKey privateKey = (RSAPrivateKey) keyPair.getPrivate();
                RSAKey rsaKey = new RSAKey.Builder(publicKey)
                                .privateKey(privateKey)
                                .keyID(UUID.randomUUID().toString())
                                .build();
                JWKSet jwkSet = new JWKSet(rsaKey);
                return new ImmutableJWKSet<>(jwkSet);
        }

        // JwtDecoder para validar tokens JWT en el Resource Server
        @Bean
        public JwtDecoder jwtDecoder(JWKSource<SecurityContext> jwkSource) {
                return OAuth2AuthorizationServerConfiguration.jwtDecoder(jwkSource);
        }

        private static KeyPair generateRsaKey() {
                try {
                        KeyPairGenerator keyPairGenerator = KeyPairGenerator.getInstance("RSA");
                        keyPairGenerator.initialize(2048);
                        return keyPairGenerator.generateKeyPair();
                } catch (Exception ex) {
                        throw new IllegalStateException(ex);
                }
        }

        // CUSTOMIZER PARA INCLUIR ROLES EN EL TOKEN
        @Bean
        public org.springframework.security.oauth2.server.authorization.token.OAuth2TokenCustomizer<org.springframework.security.oauth2.server.authorization.token.JwtEncodingContext> jwtTokenCustomizer() {
                return (context) -> {
                        String tokenType = context.getTokenType().getValue();
                        if ("id_token".equals(tokenType) || "access_token".equals(tokenType)) {
                                context.getClaims().claims((claims) -> {
                                        java.util.Set<String> roles = context.getPrincipal().getAuthorities().stream()
                                                        .map(org.springframework.security.core.GrantedAuthority::getAuthority)
                                                        .collect(java.util.stream.Collectors.toSet());
                                        claims.put("roles", roles);
                                        // También poner el username preferido
                                        claims.put("preferred_username", context.getPrincipal().getName());
                                });
                        }
                };
        }
}
