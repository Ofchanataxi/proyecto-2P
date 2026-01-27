# 🔧 SOLUCIÓN OAuth 2.0 + PKCE - Spring Authorization Server + React

## ❌ PROBLEMAS IDENTIFICADOS

### 1. **RegisteredClient sin URIs de producción**

- ❌ Solo tenía `localhost:3000` y `127.0.0.1:3000`
- ✅ Faltaban `http://34.130.207.184:3000` y `http://34.130.207.184:3000/`

### 2. **Issuer incorrecto**

- ❌ `AuthorizationServerSettings` tenía `issuer("http://localhost:9000")`
- ❌ `application.properties` tenía `spring.security.oauth2.authorizationserver.issuer=http://localhost:9000`
- ✅ Ambos deben ser `http://34.130.207.184:9000`

### 3. **Logout redirect incorrecto**

- ❌ `logoutSuccessUrl("http://localhost:3000")`
- ✅ Debe ser `logoutSuccessUrl("http://34.130.207.184:3000")`

### 4. **Frontend redirect_uri sin trailing slash**

- ❌ `redirect_uri: window.location.origin` → `http://34.130.207.184:3000`
- ✅ Backend registrado con `/` → `http://34.130.207.184:3000/`
- ✅ Cambiado a `redirect_uri: window.location.origin + "/"`

### 5. **CORS sin MaxAge**

- ✅ Agregado `configuration.setMaxAge(3600L)` para cachear preflight 1 hora

---

## ✅ CAMBIOS REALIZADOS

### Backend: `SecurityConfig.java`

```java
// 1. REGISTERED CLIENT CON IPs PÚBLICAS
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
        // ✅ URIs DE PRODUCCIÓN (IP PÚBLICO)
        .redirectUri("http://34.130.207.184:3000")
        .redirectUri("http://34.130.207.184:3000/")
        .postLogoutRedirectUri("http://localhost:3000")
        .postLogoutRedirectUri("http://127.0.0.1:3000")
        .postLogoutRedirectUri("http://34.130.207.184:3000")  // ✅
        .scope(OidcScopes.OPENID)
        .scope(OidcScopes.PROFILE)
        .scope("read")
        .scope("write")
        .clientSettings(ClientSettings.builder()
            .requireAuthorizationConsent(false)
            .requireProofKey(true)  // ✅ PKCE REQUERIDO
            .build())
        .build();

    return new InMemoryRegisteredClientRepository(reactClient);
}

// 2. ISSUER PÚBLICO
@Bean
public AuthorizationServerSettings authorizationServerSettings() {
    return AuthorizationServerSettings.builder()
        .issuer("http://34.130.207.184:9000")  // ✅ IP PÚBLICA
        .build();
}

// 3. LOGOUT REDIRECT PÚBLICO
.logout(logout -> logout
    .logoutRequestMatcher(
        new org.springframework.security.web.util.matcher.AntPathRequestMatcher("/logout", "GET"))
    .logoutSuccessUrl("http://34.130.207.184:3000")  // ✅ IP PÚBLICA
    .invalidateHttpSession(true)
    .clearAuthentication(true)
    .deleteCookies("JSESSIONID")
    .permitAll());

// 4. CORS CON MaxAge
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
    configuration.setMaxAge(3600L);  // ✅ CACHE PREFLIGHT 1 HORA

    UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
    source.registerCorsConfiguration("/**", configuration);
    return source;
}
```

### Backend: `application.properties`

```properties
# ✅ ISSUER PÚBLICO
spring.security.oauth2.authorizationserver.issuer=http://34.130.207.184:9000
```

### Frontend: `main.jsx`

```javascript
const oidcConfig = {
  authority:
    import.meta.env.VITE_OIDC_AUTHORITY || "http://34.130.207.184:9000",
  client_id: "farmacia-frontend",
  redirect_uri: window.location.origin + "/", // ✅ CON TRAILING SLASH
  post_logout_redirect_uri: window.location.origin,
  response_type: "code", // ✅ AUTHORIZATION CODE
  scope: "openid profile read write",
  automaticSilentRenew: false,
  loadUserInfo: true,
  onSigninCallback: () => {
    window.history.replaceState({}, document.title, window.location.pathname);
  },
};
```

**NOTA**: `react-oidc-context` maneja PKCE automáticamente cuando:

- `response_type: "code"` ✅
- No hay `client_secret` o es público ✅
- Spring Authorization Server tiene `.requireProofKey(true)` ✅

---

## 🚀 PASOS PARA DESPLEGAR

### 1. Reconstruir y reiniciar oauth-server

```bash
cd proyecto-2P
docker-compose stop oauth-server
docker-compose rm -f oauth-server
docker-compose build oauth-server
docker-compose up -d oauth-server
```

### 2. Reconstruir y reiniciar frontend

```bash
docker-compose stop ms-frontend
docker-compose rm -f ms-frontend
docker-compose build ms-frontend
docker-compose up -d ms-frontend
```

### 3. Verificar logs

```bash
# Backend
docker-compose logs -f oauth-server

# Frontend
docker-compose logs -f ms-frontend
```

### 4. Probar flujo OAuth

1. Abrir: `http://34.130.207.184:3000`
2. Click en "Login"
3. Debe redirigir a: `http://34.130.207.184:9000/oauth2/authorize?...`
4. Ingresar credenciales
5. Debe volver a: `http://34.130.207.184:3000/?code=...`
6. Frontend intercambia `code` por `access_token`
7. Usuario queda autenticado

---

## 🔍 VERIFICAR CONFIGURACIÓN

### 1. OpenID Configuration

```bash
curl http://34.130.207.184:9000/.well-known/openid-configuration | jq
```

**Debe mostrar:**

```json
{
  "issuer": "http://34.130.207.184:9000",
  "authorization_endpoint": "http://34.130.207.184:9000/oauth2/authorize",
  "token_endpoint": "http://34.130.207.184:9000/oauth2/token",
  "jwks_uri": "http://34.130.207.184:9000/oauth2/jwks"
}
```

### 2. Inspeccionar request en navegador

**Abrir DevTools → Network → filtrar por "authorize"**

Debe tener:

```
GET http://34.130.207.184:9000/oauth2/authorize?
  response_type=code
  &client_id=farmacia-frontend
  &redirect_uri=http://34.130.207.184:3000/
  &scope=openid profile read write
  &code_challenge=XXXXXX
  &code_challenge_method=S256  ← PKCE ✅
```

### 3. Verificar token exchange

**DevTools → Network → filtrar por "token"**

```
POST http://34.130.207.184:9000/oauth2/token
Content-Type: application/x-www-form-urlencoded

grant_type=authorization_code
&code=XXXXXX
&redirect_uri=http://34.130.207.184:3000/
&client_id=farmacia-frontend
&code_verifier=XXXXXX  ← PKCE ✅
```

---

## 🐛 TROUBLESHOOTING

### Error: "redirect_uri mismatch"

- ✅ Verificar que `redirect_uri` en request coincida **EXACTAMENTE** con alguno registrado
- ✅ Backend tiene: `http://34.130.207.184:3000` y `http://34.130.207.184:3000/`
- ✅ Frontend usa: `window.location.origin + "/"` → `http://34.130.207.184:3000/`

### Error: "invalid_request - PKCE required"

- ✅ Backend tiene `.requireProofKey(true)`
- ✅ Frontend usa `response_type: "code"` (react-oidc-context maneja PKCE automáticamente)

### Error CORS

- ✅ Verificar que `http://34.130.207.184:3000` esté en `allowedOrigins`
- ✅ Verificar que `cors(Customizer.withDefaults())` esté en **todos** los SecurityFilterChain

### No redirige después de login

- ✅ Verificar que `onSigninCallback` se ejecute
- ✅ Verificar que no haya errores en Console de navegador
- ✅ Verificar que `code` query param exista en URL después de redirect

---

## ✅ CONFIRMACIÓN FINAL

Después de desplegar, el flujo completo debe ser:

1. **Usuario en `http://34.130.207.184:3000` → click Login**
2. **Redirect a `http://34.130.207.184:9000/oauth2/authorize?...` con PKCE**
3. **Login en página Spring Security**
4. **Redirect de vuelta a `http://34.130.207.184:3000/?code=...`**
5. **Frontend hace POST a `http://34.130.207.184:9000/oauth2/token` con code_verifier**
6. **Backend responde con `access_token`**
7. **Frontend guarda token y muestra UI autenticada**

Si algún paso falla, revisar:

- Logs de `oauth-server`: `docker-compose logs oauth-server`
- Console del navegador: DevTools → Console
- Network requests: DevTools → Network

---

**IMPORTANTE**: Si cambiaste IPs públicas, actualiza:

- `.env` → `VITE_OIDC_AUTHORITY`
- `SecurityConfig.java` → `redirectUri()`, `postLogoutRedirectUri()`, `issuer()`
- `application.properties` → `spring.security.oauth2.authorizationserver.issuer`
