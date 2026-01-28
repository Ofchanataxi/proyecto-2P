# Guía de Configuración con Variables de Entorno

## Configuración Centralizada

Este proyecto ahora utiliza un archivo `.env` centralizado para manejar la configuración de producción. Esto facilita el despliegue en diferentes entornos sin necesidad de modificar el código.

## Archivo .env Principal

El archivo `.env` en la raíz del proyecto contiene todas las configuraciones necesarias:

```bash
# IP pública del servidor
PUBLIC_IP=34.130.207.184

# URLs Base
FRONTEND_URL=http://34.130.207.184:3000
OAUTH_URL=http://34.130.207.184:9000
GATEWAY_URL=http://34.130.207.184:8080
```

## Cómo Cambiar la IP para Producción

### Opción 1: Modificar el archivo .env (Recomendado)

1. Edita el archivo `.env` en la raíz del proyecto
2. Cambia el valor de `PUBLIC_IP` a tu nueva IP
3. Las demás variables se actualizarán automáticamente
4. Ejecuta `docker-compose up --build -d` para reconstruir y desplegar

```bash
# Ejemplo: Cambiar a una nueva IP
PUBLIC_IP=35.XXX.XXX.XXX
FRONTEND_URL=http://35.XXX.XXX.XXX:3000
OAUTH_URL=http://35.XXX.XXX.XXX:9000
GATEWAY_URL=http://35.XXX.XXX.XXX:8080
```

### Opción 2: Variables de entorno del sistema

También puedes establecer las variables de entorno directamente en tu sistema o servidor:

```bash
export PUBLIC_IP=35.XXX.XXX.XXX
export FRONTEND_URL=http://35.XXX.XXX.XXX:3000
export OAUTH_URL=http://35.XXX.XXX.XXX:9000
export GATEWAY_URL=http://35.XXX.XXX.XXX:8080
```

## Arquitectura de Variables

### Variables Principales

- **PUBLIC_IP**: IP pública del servidor
- **FRONTEND_URL**: URL completa del frontend (incluye puerto 3000)
- **OAUTH_URL**: URL del servidor OAuth (incluye puerto 9000)
- **GATEWAY_URL**: URL del API Gateway (incluye puerto 8080)

### Variables de Base de Datos

- **MYSQL_ROOT_PASSWORD**: Contraseña de MySQL
- **POSTGRES_USER/POSTGRES_PASSWORD**: Credenciales de PostgreSQL

### URLs Internas (Docker)

Estas URLs se usan para la comunicación entre contenedores:

- `CATALOGO_INTERNAL_URL=http://ms-catalogo:8081`
- `INVENTARIO_INTERNAL_URL=http://ms-inventario:8082`
- `VENTAS_INTERNAL_URL=http://ms-ventas:8083`

## Archivos Afectados

Los siguientes archivos ahora leen desde variables de entorno:

### Backend (Java)

- `oauth-server/src/main/java/ec/edu/espe/oauthserver/oauth/SecurityConfig.java`
- `ms-catalogo/src/main/resources/application.properties`
- `ms-inventario/src/main/resources/application.properties`
- `ms-ventas/src/main/resources/application.properties`
- `oauth-server/src/main/resources/application.properties`

### Frontend (React)

- `ms-frontend/.env`
- `ms-frontend/src/services/*.js`
- `ms-frontend/src/context/AuthContext.jsx`

### Infraestructura

- `docker-compose.yml`

## Despliegue Rápido

```bash
# 1. Actualizar .env con tu IP
nano .env

# 2. Reconstruir y desplegar
docker-compose down
docker-compose up --build -d

# 3. Verificar logs
docker-compose logs -f
```

## Desarrollo Local

Para desarrollo local, las variables tienen valores por defecto que apuntan a `localhost`:

- Frontend: `http://localhost:3000`
- OAuth: `http://localhost:9000`
- Gateway: `http://localhost:8080`

No es necesario modificar nada para trabajar en local.

## Solución de Problemas

### Error: "Failed to fetch"

- Verifica que las URLs en `.env` sean correctas
- Asegúrate de que todos los servicios estén corriendo: `docker-compose ps`

### Error: OAuth redirect mismatch

- Verifica que `FRONTEND_URL` en `.env` coincida con la URL desde donde accedes
- Reconstruye el contenedor oauth-server: `docker-compose up -d --build oauth-server`

### Error: CORS

- Asegúrate de que `FRONTEND_URL` esté correctamente configurada
- Verifica que no haya IPs antiguas en el código

## Notas Importantes

1. **Siempre reconstruye después de cambiar .env**: `docker-compose up --build -d`
2. **El frontend necesita reconstruirse** porque las variables se inyectan en tiempo de compilación
3. **Mantén backups del .env** antes de hacer cambios
4. **No subas .env a Git** (ya está en .gitignore)

## Verificación Post-Despliegue

Accede a las siguientes URLs (reemplaza con tu IP):

- Frontend: `http://34.130.207.184:3000`
- OAuth Server: `http://34.130.207.184:9000/.well-known/openid-configuration`
- API Gateway: `http://34.130.207.184:8080/actuator/health`
