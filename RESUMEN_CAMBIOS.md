# 📝 Resumen de Cambios - Centralización de Configuración

## 🎯 Objetivo

Centralizar toda la configuración de IP y URLs en un archivo `.env` para facilitar el despliegue en producción sin modificar el código fuente.

## 📊 IP Actualizada

- **IP Antigua**: `34.130.32.93`
- **IP Nueva**: `34.130.207.184`

## 🔧 Cambios Realizados

### 1. Archivo .env Principal (NUEVO)

**Ubicación**: `/.env`

Archivo centralizado con todas las variables de entorno:

- `PUBLIC_IP`: IP pública del servidor
- `FRONTEND_URL`: URL del frontend
- `OAUTH_URL`: URL del servidor OAuth
- `GATEWAY_URL`: URL del API Gateway
- Configuraciones de base de datos
- URLs internas de microservicios

### 2. Docker Compose Actualizado

**Archivo**: `/docker-compose.yml`

Todos los servicios ahora leen desde variables de entorno:

- ✅ `mysql-db`: Usa `${MYSQL_ROOT_PASSWORD}`
- ✅ `postgres-db`: Usa `${POSTGRES_USER}` y `${POSTGRES_PASSWORD}`
- ✅ `ms-catalogo`: Usa `${OAUTH_URL}` y `${MYSQL_*}`
- ✅ `ms-inventario`: Usa `${OAUTH_URL}` y `${MYSQL_*}`
- ✅ `ms-ventas`: Usa `${OAUTH_URL}` y `${MYSQL_*}`
- ✅ `gateway`: Usa URLs internas desde variables
- ✅ `ms-frontend`: Usa `${FRONTEND_URL}`, `${OAUTH_URL}`, `${GATEWAY_URL}`
- ✅ `oauth-server`: Usa `${FRONTEND_URL}` y `${OAUTH_URL}`

### 3. Backend (Java)

#### SecurityConfig.java

**Archivo**: `/oauth-server/src/main/java/ec/edu/espe/oauthserver/oauth/SecurityConfig.java`

Cambios:

- ✅ Agregado `@Value` para inyectar variables de entorno
- ✅ Campo `frontendUrl` lee desde `${FRONTEND_URL}`
- ✅ Campo `oauthIssuerUri` lee desde `${OAUTH_ISSUER_URI}`
- ✅ CORS ahora usa `frontendUrl` en lugar de IP hardcodeada
- ✅ Logout redirect usa `frontendUrl`
- ✅ RegisteredClient usa `frontendUrl` para redirect URIs
- ✅ AuthorizationServerSettings usa `oauthIssuerUri`

#### Application Properties

**Archivos Actualizados**:

- `/ms-catalogo/src/main/resources/application.properties`
- `/ms-inventario/src/main/resources/application.properties`
- `/ms-ventas/src/main/resources/application.properties`
- `/oauth-server/src/main/resources/application.properties`

Cambios:

- ✅ `spring.security.oauth2.resourceserver.jwt.issuer-uri` ahora usa `${OAUTH_ISSUER_URI:http://localhost:9000}`
- ✅ Valores por defecto para desarrollo local

### 4. Frontend (React)

#### .env del Frontend

**Archivo**: `/ms-frontend/.env`

Actualizado con la nueva IP:

```env
VITE_API_GATEWAY=http://34.130.207.184:8080
VITE_OIDC_AUTHORITY=http://34.130.207.184:9000
VITE_FRONTEND_URL=http://34.130.207.184:3000
```

#### Servicios JavaScript

**Archivos Actualizados**:

- `/ms-frontend/src/services/ventasService.js`
- `/ms-frontend/src/services/usuarioService.js`
- `/ms-frontend/src/services/inventarioService.js`
- `/ms-frontend/src/services/catalogoService.js`
- `/ms-frontend/src/context/AuthContext.jsx`

Cambios:

- ✅ Fallback cambiado de IP hardcodeada a `http://localhost:*`
- ✅ Ahora dependen completamente de variables de entorno

#### Dockerfile del Frontend

**Archivo**: `/ms-frontend/Dockerfile`

Actualizado con la nueva IP en los argumentos de build.

### 5. Scripts de Automatización (NUEVOS)

#### change-ip.sh (Linux/Mac)

**Ubicación**: `/change-ip.sh`

Script bash para cambiar la IP automáticamente:

```bash
./change-ip.sh 35.XXX.XXX.XXX
```

#### change-ip.ps1 (Windows)

**Ubicación**: `/change-ip.ps1`

Script PowerShell para cambiar la IP automáticamente:

```powershell
.\change-ip.ps1 35.XXX.XXX.XXX
```

Características:

- ✅ Validación de formato de IP
- ✅ Backup automático del .env anterior
- ✅ Actualiza .env principal y frontend/.env
- ✅ Muestra resumen de cambios
- ✅ Instrucciones para aplicar cambios

### 6. Documentación (NUEVA)

#### GUIA_CONFIGURACION_ENV.md

**Ubicación**: `/GUIA_CONFIGURACION_ENV.md`

Guía completa que incluye:

- ✅ Cómo cambiar la IP para producción
- ✅ Arquitectura de variables de entorno
- ✅ Archivos afectados
- ✅ Pasos de despliegue
- ✅ Solución de problemas
- ✅ Verificación post-despliegue

#### .env.example

**Ubicación**: `/.env.example`

Plantilla de ejemplo del archivo .env para referencia.

#### README.md Actualizado

**Archivo**: `/README.md`

Agregada sección sobre configuración de IP con:

- ✅ Referencia a los scripts de cambio de IP
- ✅ Enlace a la guía de configuración
- ✅ IP actual configurada
- ✅ Diferenciación entre desarrollo y producción

## 📋 Resumen de Archivos Modificados

### Configuración

- ✅ `/.env` (NUEVO)
- ✅ `/.env.example` (NUEVO)
- ✅ `/docker-compose.yml`

### Backend

- ✅ `/oauth-server/src/main/java/ec/edu/espe/oauthserver/oauth/SecurityConfig.java`
- ✅ `/oauth-server/src/main/resources/application.properties`
- ✅ `/ms-catalogo/src/main/resources/application.properties`
- ✅ `/ms-inventario/src/main/resources/application.properties`
- ✅ `/ms-ventas/src/main/resources/application.properties`

### Frontend

- ✅ `/ms-frontend/.env`
- ✅ `/ms-frontend/Dockerfile`
- ✅ `/ms-frontend/src/services/ventasService.js`
- ✅ `/ms-frontend/src/services/usuarioService.js`
- ✅ `/ms-frontend/src/services/inventarioService.js`
- ✅ `/ms-frontend/src/services/catalogoService.js`
- ✅ `/ms-frontend/src/context/AuthContext.jsx`

### Scripts

- ✅ `/change-ip.sh` (NUEVO)
- ✅ `/change-ip.ps1` (NUEVO)

### Documentación

- ✅ `/GUIA_CONFIGURACION_ENV.md` (NUEVO)
- ✅ `/README.md`
- ✅ `/RESUMEN_CAMBIOS.md` (este archivo)

## 🚀 Cómo Usar la Nueva Configuración

### Para Cambiar la IP:

**Opción 1: Script Automático (Recomendado)**

```bash
# Linux/Mac
./change-ip.sh 35.XXX.XXX.XXX

# Windows
.\change-ip.ps1 35.XXX.XXX.XXX
```

**Opción 2: Manual**

1. Editar `/.env`
2. Cambiar `PUBLIC_IP`, `FRONTEND_URL`, `OAUTH_URL`, `GATEWAY_URL`
3. Editar `/ms-frontend/.env` con las mismas URLs
4. Ejecutar:
   ```bash
   docker-compose down
   docker-compose up --build -d
   ```

### Para Desarrollo Local:

No es necesario cambiar nada. Los valores por defecto apuntan a `localhost`.

### Para Producción:

1. Usa uno de los scripts de cambio de IP
2. Reconstruye los contenedores
3. Verifica que todos los servicios estén funcionando

## ✅ Beneficios

1. **Centralización**: Un solo archivo para toda la configuración
2. **Facilidad**: Cambiar IP ahora toma segundos, no minutos
3. **Sin errores**: No hay que buscar IPs en múltiples archivos
4. **Automatización**: Scripts que hacen el trabajo por ti
5. **Documentación**: Guías claras para el equipo
6. **Backups**: Los scripts crean backups automáticos
7. **Validación**: Los scripts validan el formato de IP
8. **Portabilidad**: Fácil mover entre ambientes (dev/staging/prod)

## 🔍 Verificación

Después de aplicar los cambios, verifica:

1. **Frontend**: `http://TU_IP:3000`
2. **OAuth Config**: `http://TU_IP:9000/.well-known/openid-configuration`
3. **Gateway Health**: `http://TU_IP:8080/actuator/health`

## 📝 Notas Importantes

1. **Siempre reconstruir**: Después de cambiar `.env`, ejecuta `docker-compose up --build -d`
2. **Frontend necesita rebuild**: Las variables de Vite se inyectan en tiempo de build
3. **Backups automáticos**: Los scripts crean backups del .env anterior
4. **No subir .env a Git**: Ya está en `.gitignore`

## 🎉 Resultado Final

Ahora puedes cambiar la IP de producción en **menos de 1 minuto**:

1. Ejecutar script: `./change-ip.sh NUEVA_IP`
2. Reconstruir: `docker-compose up --build -d`
3. ¡Listo!

---

**Fecha de Cambios**: 28 de enero de 2026
**IP Configurada**: 34.130.207.184
