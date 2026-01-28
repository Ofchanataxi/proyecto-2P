# 🚀 Despliegue Rápido con Nueva IP

## ⚡ Inicio Rápido

Tu proyecto ya está configurado con la **nueva IP: 34.130.207.184**

### Opción 1: Despliegue Directo (IP ya configurada)

```bash
# 1. Ir al directorio del proyecto
cd "proyecto-2P"

# 2. Detener contenedores anteriores (si existen)
docker-compose down

# 3. Reconstruir y levantar con la nueva configuración
docker-compose up --build -d

# 4. Ver logs (opcional)
docker-compose logs -f
```

### Opción 2: Si necesitas cambiar la IP en el futuro

**En Windows (PowerShell):**

```powershell
.\change-ip.ps1 TU_NUEVA_IP
docker-compose down
docker-compose up --build -d
```

**En Linux/Mac:**

```bash
./change-ip.sh TU_NUEVA_IP
docker-compose down
docker-compose up --build -d
```

## 🔍 Verificar que todo funciona

### 1. Ver estado de contenedores

```bash
docker-compose ps
```

Todos deben estar en estado "Up"

### 2. Probar servicios

**Frontend:**

```
http://34.130.207.184:3000
```

**OAuth Server (verificar configuración):**

```
http://34.130.207.184:9000/.well-known/openid-configuration
```

**API Gateway (health check):**

```
http://34.130.207.184:8080/actuator/health
```

### 3. Probar Login

1. Ir a `http://34.130.207.184:3000`
2. Click en "Iniciar Sesión"
3. Usar credenciales:
   - Usuario: `admin`
   - Contraseña: `admin123`

## 📋 URLs de los Servicios

| Servicio         | URL                                  |
| ---------------- | ------------------------------------ |
| **Frontend**     | http://34.130.207.184:3000           |
| **API Gateway**  | http://34.130.207.184:8080           |
| **OAuth Server** | http://34.130.207.184:9000           |
| **Catálogo**     | http://34.130.207.184:8081 (interno) |
| **Inventario**   | http://34.130.207.184:8082 (interno) |
| **Ventas**       | http://34.130.207.184:8083 (interno) |

## 🛠️ Comandos Útiles

### Ver logs de un servicio específico

```bash
docker-compose logs -f ms-frontend
docker-compose logs -f oauth-server
docker-compose logs -f gateway
```

### Reiniciar un servicio específico

```bash
docker-compose restart ms-frontend
docker-compose restart oauth-server
```

### Reconstruir solo un servicio

```bash
docker-compose up -d --build ms-frontend
docker-compose up -d --build oauth-server
```

### Ver uso de recursos

```bash
docker stats
```

### Limpiar todo y empezar de cero

```bash
docker-compose down -v
docker-compose up --build -d
```

## ❌ Solución de Problemas

### Error: "Cannot connect to OAuth"

```bash
# Verificar que oauth-server esté corriendo
docker-compose logs oauth-server

# Reiniciar oauth-server
docker-compose restart oauth-server
```

### Error: "Failed to fetch" en el frontend

```bash
# Verificar que el gateway esté corriendo
docker-compose logs gateway

# Verificar la IP en el .env
cat .env | grep PUBLIC_IP

# Reconstruir frontend si la IP cambió
docker-compose up -d --build ms-frontend
```

### Los contenedores no inician

```bash
# Ver todos los logs
docker-compose logs

# Verificar que no haya conflictos de puertos
netstat -ano | findstr "3000"
netstat -ano | findstr "8080"
netstat -ano | findstr "9000"

# En Linux/Mac
lsof -i :3000
lsof -i :8080
lsof -i :9000
```

### Base de datos no se conecta

```bash
# Verificar MySQL
docker-compose logs mysql-db

# Verificar PostgreSQL
docker-compose logs postgres-db

# Reiniciar bases de datos
docker-compose restart mysql-db postgres-db
```

## 📱 Acceso desde Otros Dispositivos

Para acceder desde otros dispositivos en la misma red:

1. Asegúrate de que los puertos estén abiertos en el firewall:
   - Puerto 3000 (Frontend)
   - Puerto 8080 (Gateway)
   - Puerto 9000 (OAuth)

2. Usa la IP pública: `http://34.130.207.184:3000`

## 🔒 Seguridad en Producción

⚠️ **Importante para producción real:**

1. Cambiar contraseñas de las bases de datos en `.env`:

   ```env
   MYSQL_ROOT_PASSWORD=tu_password_seguro
   POSTGRES_PASSWORD=tu_password_seguro
   ```

2. Habilitar HTTPS (requiere certificado SSL)
3. Configurar firewall para limitar acceso
4. Cambiar credenciales de usuarios por defecto

## 📚 Documentación Adicional

- **Configuración detallada**: [GUIA_CONFIGURACION_ENV.md](GUIA_CONFIGURACION_ENV.md)
- **Cambios realizados**: [RESUMEN_CAMBIOS.md](RESUMEN_CAMBIOS.md)
- **README principal**: [README.md](README.md)

## 🎉 ¡Todo Listo!

Si seguiste estos pasos, tu aplicación debería estar funcionando en:
**http://34.130.207.184:3000**

Para cualquier problema, consulta la sección de solución de problemas arriba o revisa los logs con `docker-compose logs`.
