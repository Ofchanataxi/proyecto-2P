# 🔴 FIX: Error "Crypto.subtle is available only in secure contexts"

## EL PROBLEMA

Tu aplicación fallaba con:

```
Error de Autenticación
Crypto.subtle is available only in secure contexts (HTTPS)
```

### ¿Por qué pasaba esto?

1. **PKCE requiere Crypto.subtle**:
   - Para generar `code_challenge` con SHA-256
   - Web Crypto API del navegador

2. **Navegadores bloquean Crypto.subtle en HTTP**:
   - ✅ Funciona: `https://...` o `http://localhost`
   - ❌ Falla: `http://34.130.207.184:3000` (IP pública sin SSL)

3. **Tu configuración anterior**:
   - Backend: `.requireProofKey(true)` → exigía PKCE
   - Frontend: intentaba usar PKCE automáticamente
   - Navegador: bloqueaba la operación → **LOGIN FALLABA**

---

## ✅ LA SOLUCIÓN

Deshabilitamos PKCE temporalmente para que funcione sin HTTPS.

### Cambios realizados:

#### 1. Backend: [SecurityConfig.java](oauth-server/src/main/java/ec/edu/espe/oauthserver/oauth/SecurityConfig.java#L198-L201)

```java
.clientSettings(ClientSettings.builder()
    .requireAuthorizationConsent(false)
    .requireProofKey(false)  // ✅ CAMBIADO de true a false
    .build())
```

#### 2. Frontend: [main.jsx](ms-frontend/src/main.jsx#L8-L21)

```javascript
const oidcConfig = {
  authority: "http://34.130.207.184:9000",
  client_id: "farmacia-frontend",
  redirect_uri: window.location.origin + "/",
  post_logout_redirect_uri: window.location.origin,
  response_type: "code",
  scope: "openid profile read write",
  automaticSilentRenew: false,
  loadUserInfo: true,
  // ✅ AGREGADO - Fuerza desactivación de PKCE
  metadata: {
    code_challenge_methods_supported: [],
  },
  onSigninCallback: () => {
    window.history.replaceState({}, document.title, window.location.pathname);
  },
};
```

---

## 🚀 COMANDOS PARA APLICAR EL FIX

Copia y pega estos comandos en PowerShell **DESDE LA CARPETA proyecto-2P**:

```powershell
# 1. Detener contenedores
docker-compose stop oauth-server ms-frontend

# 2. Eliminar contenedores viejos
docker-compose rm -f oauth-server ms-frontend

# 3. Reconstruir SIN CACHE (importante para que tome los cambios)
docker-compose build --no-cache oauth-server ms-frontend

# 4. Levantar servicios
docker-compose up -d oauth-server ms-frontend

# 5. Ver logs (Ctrl+C para salir)
docker-compose logs -f oauth-server ms-frontend
```

### Tiempo estimado: ~5 minutos

Espera a ver en los logs:

```
oauth-server    | Started OauthServerApplication in X seconds
ms-frontend     | ready in X ms
```

---

## ✅ VERIFICAR QUE FUNCIONA

### 1. Abrir navegador

```
http://34.130.207.184:3000
```

### 2. Click en "Iniciar Sesión"

Debe redirigir a:

```
http://34.130.207.184:9000/oauth2/authorize?...
```

### 3. Login con credenciales

Ejemplo:

- Usuario: `admin`
- Password: la que configuraste

### 4. Debe volver autenticado

Si ves el dashboard o perfil → **✅ FUNCIONÓ**

---

## 🔍 DEBUGGING

### Si sigue fallando, revisa:

#### A. DevTools → Console

```javascript
// NO debe aparecer:
Error: Crypto.subtle is available only in secure contexts
```

#### B. DevTools → Network → filtrar "authorize"

La URL **NO debe tener**:

```
code_challenge=XXXXXXX
code_challenge_method=S256
```

Debe ser algo así:

```
http://34.130.207.184:9000/oauth2/authorize?
  response_type=code
  &client_id=farmacia-frontend
  &redirect_uri=http://34.130.207.184:3000/
  &scope=openid+profile+read+write
  &state=XXXXXXX
```

#### C. Verificar que se reconstruyó

```powershell
# Ver imágenes Docker
docker images | Select-String "oauth-server|ms-frontend"

# Deben tener fecha/hora reciente (no de hace días)
```

Si las imágenes son viejas, el `build --no-cache` no funcionó correctamente.

#### D. Logs del backend

```powershell
docker-compose logs oauth-server | Select-String -Pattern "error|exception" -CaseSensitive:$false
```

No debe haber errores relacionados con "PKCE" o "code_challenge".

---

## ⚠️ IMPORTANTE PARA PRODUCCIÓN

**Esta solución es temporal para desarrollo sin HTTPS.**

En producción real:

### Opción 1: Usar HTTPS (recomendado)

1. Configurar certificado SSL (Let's Encrypt, Cloudflare, etc.)
2. Cambiar URIs a `https://`
3. Reactivar PKCE:
   ```java
   .requireProofKey(true)  // ✅ En producción con HTTPS
   ```
4. Eliminar `metadata` del frontend

### Opción 2: Proxy con SSL Termination

- Nginx/Traefik con SSL en el edge
- Backend sigue en HTTP internamente
- Cliente ve HTTPS → Crypto.subtle funciona

### Opción 3: Túnel HTTPS (desarrollo)

```bash
# Con ngrok
ngrok http 3000

# Obtienes: https://abc123.ngrok.io
# Actualiza URIs en backend y frontend
```

---

## 📝 RESUMEN

| Antes                 | Después                |
| --------------------- | ---------------------- |
| PKCE habilitado       | PKCE deshabilitado     |
| Requiere HTTPS        | Funciona con HTTP      |
| `Crypto.subtle` falla | No usa `Crypto.subtle` |
| Login falla ❌        | Login funciona ✅      |

**Cambios de código**: 2 archivos
**Tiempo de fix**: ~5 minutos
**Seguridad**: Suficiente para desarrollo, NO para producción con datos reales

---

## ✅ CHECKLIST FINAL

- [ ] Detuve los contenedores viejos
- [ ] Eliminé contenedores con `rm -f`
- [ ] Reconstruí con `--no-cache`
- [ ] Levanté los servicios nuevos
- [ ] Abrí `http://34.130.207.184:3000`
- [ ] Click en "Iniciar Sesión"
- [ ] Me redirigió al login de OAuth
- [ ] Ingresé credenciales
- [ ] Volví autenticado a la app
- [ ] ✅ **LOGIN FUNCIONA**

Si completaste todos los pasos y sigue fallando, revisa:

1. Logs: `docker-compose logs oauth-server ms-frontend`
2. Console del navegador (F12)
3. Network tab del navegador

---

**Dudas o errores**: Comparte los logs exactos y capturas del DevTools.
