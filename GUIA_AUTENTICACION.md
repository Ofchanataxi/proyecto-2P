# Sistema de Autenticación - Farmacia Online

## ✨ Características Implementadas

### 🔐 Autenticación y Autorización

- **Microservicio de Autenticación** (`ms-auth`) con Spring Boot y JWT
- **Dos roles de usuario:**
  - **ADMIN**: Acceso completo al sistema (CRUD de productos, sucursales, inventario)
  - **MEDICO**: Solo puede comprar productos en el carrito

### 👥 Usuarios de Prueba

| Usuario | Contraseña | Rol    | Email                |
| ------- | ---------- | ------ | -------------------- |
| admin   | admin123   | ADMIN  | admin@farmacia.com   |
| medico1 | admin123   | MEDICO | medico1@hospital.com |
| medico2 | admin123   | MEDICO | medico2@hospital.com |

## 🚀 Cómo Ejecutar el Sistema

### 1. Iniciar los servicios con Docker Compose

```bash
docker-compose up --build
```

Esto iniciará:

- MySQL (puerto 3307)
- ms-auth (puerto 8084)
- ms-catalogo (puerto 8081)
- ms-inventario (puerto 8082)
- ms-ventas (puerto 8083)
- gateway (puerto 8080)
- ms-frontend (puerto 3000)

### 2. Acceder a la aplicación

Abre tu navegador en: **http://localhost:3000**

## 📱 Flujo de Uso

### Login

1. Al acceder a la aplicación, verás la **pantalla de login**
2. Selecciona tu tipo de usuario:
   - **👨‍💼 Administrador**: Para gestión completa del sistema
   - **👨‍⚕️ Médico**: Para realizar compras

3. Ingresa tus credenciales:
   - Usuario: `admin` o `medico1`
   - Contraseña: `admin123`

### Como Administrador (ADMIN)

**Funcionalidades disponibles:**

- ✅ Ver catálogo completo de medicamentos
- ✅ CRUD de medicamentos
- ✅ CRUD de sucursales
- ✅ Gestión de inventario
- ✅ Realizar compras
- ✅ Ver historial de ventas

**Menú de navegación:**

- 🏠 Inicio → Catálogo de medicamentos
- ⚙️ Admin → Panel de administración
- 🛒 Carrito → Carrito de compras
- 📍 Sucursales → Gestión de sucursales

### Como Médico (MEDICO)

**Funcionalidades disponibles:**

- ✅ Ver catálogo de medicamentos
- ✅ Filtrar por categoría
- ✅ Buscar medicamentos
- ✅ Seleccionar sucursal
- ✅ Agregar productos al carrito
- ✅ Realizar compras

**Menú de navegación:**

- 🏠 Catálogo → Vista de medicamentos
- 🛒 Carrito → Carrito de compras
- 📍 Sucursales → Ver sucursales disponibles

**IMPORTANTE:** Los médicos NO tienen acceso a:

- ❌ Panel de administración
- ❌ CRUD de medicamentos
- ❌ CRUD de sucursales
- ❌ Gestión de inventario

## 🔒 Seguridad

### JWT (JSON Web Tokens)

- Tokens con expiración de 24 horas
- Almacenados en localStorage del navegador
- Validación automática en cada petición

### Rutas Protegidas

- `/admin` → Solo ADMIN
- `/medico` → Solo MEDICO
- `/carrito` → Ambos roles (autenticados)
- `/` → Solo ADMIN
- `/login` → Pública

### Validaciones

- Contraseñas encriptadas con BCrypt
- Validación de email único
- Validación de username único
- Tokens firmados con secreto seguro

## 🗄️ Base de Datos

### db_auth (Nueva base de datos)

```sql
usuarios:
  - id (BIGINT, PK)
  - username (VARCHAR 50, UNIQUE)
  - email (VARCHAR 100, UNIQUE)
  - password (VARCHAR 255, BCrypt)
  - rol (ENUM: ADMIN, MEDICO)
  - activo (BOOLEAN)
```

## 🔌 API Endpoints

### Autenticación (ms-auth)

#### Registro

```
POST /api/auth/register
Body: {
  "username": "string",
  "email": "string",
  "password": "string",
  "rol": "ADMIN" | "MEDICO"
}
```

#### Login

```
POST /api/auth/login
Body: {
  "username": "string",
  "password": "string"
}
Response: {
  "token": "jwt-token",
  "username": "string",
  "email": "string",
  "rol": "ADMIN" | "MEDICO"
}
```

#### Validar Token

```
GET /api/auth/validate?username=string
Headers: Authorization: Bearer <token>
```

## 📦 Estructura de Componentes

### Frontend

```
ms-frontend/
├── src/
│   ├── components/
│   │   ├── Header.jsx → Adaptado según rol
│   │   ├── Footer.jsx
│   │   └── ProtectedRoute.jsx → Control de acceso
│   ├── context/
│   │   ├── AuthContext.jsx → Estado de autenticación
│   │   └── CartContext.jsx
│   ├── pages/
│   │   ├── Login.jsx → Página de inicio de sesión
│   │   ├── MedicHome.jsx → Vista de médico
│   │   ├── Home.jsx → Vista de admin
│   │   ├── Admin.jsx → Panel de administración
│   │   └── Cart.jsx → Carrito de compras
│   └── services/
│       └── authService.js → Llamadas a API de auth
```

### Backend

```
ms-auth/
├── src/main/java/com/farmacia/auth/
│   ├── MsAuthApplication.java
│   ├── config/
│   │   └── SecurityConfig.java → Configuración de Spring Security
│   ├── controller/
│   │   └── AuthController.java → Endpoints de autenticación
│   ├── dto/
│   │   ├── LoginRequest.java
│   │   ├── RegisterRequest.java
│   │   └── AuthResponse.java
│   ├── entity/
│   │   └── Usuario.java → Entidad de usuario
│   ├── repository/
│   │   └── UsuarioRepository.java
│   ├── security/
│   │   └── JwtUtil.java → Utilidades JWT
│   └── service/
│       └── AuthService.java → Lógica de negocio
```

## 🔧 Configuración

### Variables de Entorno (ms-auth)

```properties
spring.datasource.url=jdbc:mysql://mysql:3306/db_auth
jwt.secret=TuSecretoMuySeguroParaJWTQueDebeSerLargoYComplejo123456789
jwt.expiration=86400000 # 24 horas en milisegundos
cors.allowed-origins=http://localhost:5173,http://localhost:3000
```

### Gateway Configuration

Las rutas del API Gateway incluyen:

```yaml
- /api/auth/** → ms-auth:8084
- /api/medicamentos/** → ms-catalogo:8081
- /api/inventarios/** → ms-inventario:8082
- /api/ventas/** → ms-ventas:8083
```

## 🎨 Características UI

### Página de Login

- Diseño moderno con gradientes
- Selección visual de rol (Admin/Médico)
- Formulario de login/registro
- Validaciones en tiempo real
- Mensajes de error claros

### Interfaz de Médico

- Catálogo simplificado de medicamentos
- Filtros por categoría
- Búsqueda en tiempo real
- Selector de sucursal
- Cards de productos con diseño atractivo
- Verificación de stock por sucursal

### Header Dinámico

- Muestra el usuario actual y su rol
- Opciones de menú según permisos
- Contador de carrito
- Botón de cerrar sesión

## 🐛 Troubleshooting

### No puedo iniciar sesión

1. Verifica que todos los contenedores estén corriendo: `docker-compose ps`
2. Revisa los logs del ms-auth: `docker logs ms-auth`
3. Asegúrate de usar las credenciales correctas

### Error de CORS

- Verifica que el frontend esté en `http://localhost:3000` o `http://localhost:5173`
- Revisa la configuración de CORS en el gateway y ms-auth

### Token inválido

- El token expira en 24 horas
- Si cambias de usuario, cierra sesión primero
- Limpia localStorage del navegador: `F12 → Application → Local Storage → Clear`

## 🚧 Próximas Mejoras

- [ ] Recuperación de contraseña
- [ ] Cambio de contraseña
- [ ] Perfil de usuario
- [ ] Historial de compras por usuario
- [ ] Notificaciones en tiempo real
- [ ] Refresh tokens
- [ ] Autenticación de dos factores

## 📝 Notas

- Los médicos solo ven medicamentos disponibles en stock
- El administrador puede gestionar todo el sistema
- Los tokens JWT se renuevan automáticamente en cada petición exitosa
- El sistema valida permisos tanto en frontend como backend

---

**¡Listo para usar! 🎉**
