# 💊 Farmacia Online - Tu Salud, Nuestra Prioridad

## 🌟 ¿Qué es Farmacia Online?

**Farmacia Online** es una plataforma digital moderna diseñada bajo una arquitectura de microservicios distribuidos. Ofrece una experiencia completa de e-commerce farmacéutico con múltiples sucursales, búsqueda inteligente, carrito de compras y un robusto sistema de seguridad basado en **OAuth 2.0 y OpenID Connect**.

Esta versión incluye un **Panel de Administración Completo** para gestionar el negocio y herramientas académicas para inspeccionar la seguridad.

### ✨ Características Principales

- 🔐 **Autenticación OAuth 2.0** - Login seguro con servidor de autorización propio (Spring Authorization Server).
- 👥 **Gestión de Usuarios (Admin)** - Panel para crear, editar y eliminar usuarios y asignar roles (ADMIN/USER).
- 🔑 **Visualizador de Token** - Herramienta académica integrada para ver y copiar el Token JWT de acceso.
- 🏪 **Gestión de Sucursales** - Administra las ubicaciones físicas de la farmacia.
- 💊 **Gestión de Medicamentos** - Control total del catálogo de productos.
- 🔍 **Búsqueda Inteligente** - Filtros por categorías, nombre y laboratorio.
- 🛒 **Carrito de Compras** - Persistencia local y flujo de compra fluido.
- 📱 **Diseño Responsivo & Premium** - Interfaz moderna con animaciones y adaptabilidad móvil.
- 🌐 **Soporte Dual** - Funciona tanto en `localhost` como en `127.0.0.1` (CORS configurado).

---

## 🏗️ Arquitectura del Sistema

El sistema utiliza una arquitectura de microservicios contenerizada con Docker:

```
┌─────────────────────────────────────────────────────────────────┐
│                        FRONTEND (React)                         │
│           http://localhost:3000 / http://127.0.0.1:3000         │
└────────┬─────────────────────────┬──────────────────────────────┘
         │                         │
         ▼                         ▼
┌──────────────────────┐    ┌─────────────────────────────────────┐
│     API GATEWAY      │    │            OAUTH SERVER             │
│   (Spring Cloud)     │    │      (Spring Authorization)         │
│ http://localhost:8080│    │      http://localhost:9000          │
└────────┬─────────────┘    └──────────────────┬──────────────────┘
         │                                     │
    ┌────┼─────────────┐                       ▼
    ▼    ▼             ▼             ┌───────────────────┐
┌─────┐ ┌──────┐ ┌─────┐             │    PostgreSQL     │
│Catá-│ │Inven-│ │Ven- │             │      :5433        │
│logo │ │tario │ │tas  │             │    (db_oauth)     │
│:8081│ │:8082 │ │:8083│             └───────────────────┘
└─┬───┘ └──┬───┘ └──┬──┘
  │        │        │
  └────────┼────────┘
           ▼
    ┌──────────────┐
    │    MySQL     │
    │    :3307     │
    └──────────────┘
```

### 📦 Servicios y Puertos

| Servicio | Puerto | Descripción | Tecnologías |
|----------|--------|-------------|-------------|
| `ms-frontend` | 3000 | Cliente Web | React, Vite, Axios, OIDC Client |
| `api-gateway` | 8080 | Puerta de Enlace | Spring Cloud Gateway |
| `oauth-server` | 9000 | Auth Server | Spring Authorization Server, JWT |
| `ms-catalogo` | 8081 | Servicio Catálogo | Spring Boot, JPA |
| `ms-inventario` | 8082 | Servicio Inventario | Spring Boot, JPA |
| `ms-ventas` | 8083 | Servicio Ventas | Spring Boot, JPA |
| `mysql-farmacia` | 3307 | Base de Datos | MySQL 8 |
| `postgres-oauth` | 5433 | Base de Datos Auth | PostgreSQL 16 |

---

## 🚀 Instalación y Despliegue

### Prerrequisitos
- **Docker Desktop** instalado y corriendo.
- **Git** para clonar el repositorio.

### Pasos de Instalación

1. **Clonar el repositorio**:
   ```bash
   git clone https://github.com/Ofchanataxi/proyecto-2P.git
   cd proyecto-2P
   git switch oauth
   ```

2. **Levantar el entorno**:
   ```bash
   docker-compose up -d --build
   ```
   *Este comando construirá todas las imágenes y levantará los contenedores.*

3. **Verificar estado**:
   ```bash
   docker-compose ps
   ```
   *Asegúrate de que todos los contenedores estén en estado "Up".*

4. **Acceder a la aplicación**:
   Abre tu navegador (Chrome/Safari/Firefox) en:
   👉 **http://localhost:3000** o **http://127.0.0.1:3000**

---

## 🔐 Credenciales y Seguridad

El sistema viene preconfigurado con usuarios para pruebas:

| Usuario | Contraseña | Rol | Acceso |
|---------|------------|-----|--------|
| `admin` | `admin123` | **ADMIN** | Acceso total al Panel de Administración |
| `usuario` | `user123` | **USER** | Compra y catálogo básico |

### Gestión de Usuarios (Nuevo)
Puedes crear nuevos usuarios directamente desde la base de datos o usando el **Panel de Administración** si estás logueado como `admin`.

Carga manual SQL (opcional):
```sql
docker exec -it postgres-oauth psql -U admin -d db_oauth -c \
  "INSERT INTO usuarios (enabled, password, role, username) VALUES (true, '{noop}nuevo123', 'USER', 'nuevo') ON CONFLICT (username) DO NOTHING;"
```

---

## ⚙️ Panel de Administración

Accede haciendo clic en el botón **"👤 Admin"** en el header (solo visible si eres ADMIN).

### Funcionalidades del Panel:
1. **💊 Medicamentos**: Crear, editar y eliminar productos del catálogo.
2. **📍 Sucursales**: Gestionar ubicaciones físicas de farmacias.
3. **📦 Inventario**: Asignar stock de medicamentos a sucursales.
4. **👥 Usuarios (CRUD Completo)**:
   - ➕ **Crear**: Nuevos usuarios con username, contraseña y rol.
   - 📋 **Listar**: Ver todos los usuarios registrados en el sistema.
   - ✏️ **Editar**: Modificar rol, estado (activo/inactivo) y resetear contraseñas.
   - 🗑️ **Eliminar**: Eliminar usuarios (excepto el admin principal).
   - 🔐 **Roles**: Asignar roles ADMIN o USER.
   - ✅ **Estado**: Activar/Desactivar cuentas de usuario.

> **Nota de Seguridad**: El usuario `admin` principal no puede ser eliminado para evitar quedarse sin acceso al sistema.

### 🔑 Token Debugging
En la parte superior del panel de administración encontrarás una sección oscura llamada **"Token de Acceso (Debug)"**. 
- Haz clic en "Mostrar" para revelar tu JWT actual.
- Usa "Copiar" para llevarlo al portapapeles y analizarlo en [jwt.io](https://jwt.io).

---

## � API REST de Usuarios

El servidor OAuth expone endpoints REST para la gestión de usuarios (requiere rol ADMIN y token JWT):

| Método | Endpoint | Descripción |
|--------|----------|-------------|
| `GET` | `/usuarios` | Obtener todos los usuarios |
| `GET` | `/usuarios/{id}` | Obtener usuario por ID |
| `GET` | `/usuarios/buscar/{username}` | Buscar usuario por username |
| `POST` | `/usuarios` | Crear nuevo usuario |
| `PUT` | `/usuarios/{id}` | Actualizar usuario existente |
| `DELETE` | `/usuarios/{id}` | Eliminar usuario |

### Ejemplo de petición (crear usuario):
```bash
curl -X POST http://localhost:9000/usuarios \
  -H "Authorization: Bearer <tu-token-jwt>" \
  -H "Content-Type: application/json" \
  -d '{"username":"nuevo","password":"clave123","role":"USER","enabled":true}'
```

---

## �🛒 Flujo de Usuario

1. **Login**: Autentícate contra el OAuth Server.
2. **Home**: Busca productos por categoría (Analgésicos, Vitaminas, etc.).
3. **Detalle**: Ve información del producto y añádelo al carrito.
4. **Checkout**: Valida tus datos en el carrito (Validación de cédula y RUC ecuatoriano integrada).
5. **Logout**: Cierre de sesión seguro con invalidación de token y modal de confirmación.

---

## 🔧 Solución de Errores Comunes

### "Failed to fetch" o Error de Login
- Asegúrate de que `oauth-server` esté corriendo (`docker logs oauth-server`).
- Si usas Safari/Chrome, intenta limpiar caché o usar modo incógnito.
- El sistema soporta CORS para `localhost` y `127.0.0.1`.

### Pantalla en blanco en Admin
- Se ha corregido un bug de renderizado. Si persiste, recarga con `Cmd+Shift+R` (Mac) o `Ctrl+F5` (Windows).
- Verifica que el usuario tenga rol `ADMIN`.

---

*Desarrollado para la materia de Sistemas Distribuidos - 2026*
