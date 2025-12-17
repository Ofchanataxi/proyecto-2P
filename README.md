# � Farmacia Online - Tu Salud, Nuestra Prioridad

## 🌟 ¿Qué es Farmacia Online?

**Farmacia Online** es una plataforma digital moderna que te permite comprar medicamentos desde la comodidad de tu hogar. Ofrecemos una experiencia completa con múltiples sucursales, búsqueda inteligente y un carrito de compras fácil de usar.

### ✨ Características Principales

🔍 **Búsqueda Inteligente** - Encuentra medicamentos por nombre, laboratorio o categoría
🏪 **Múltiples Sucursales** - Elige la sucursal más cercana a ti
🛒 **Carrito de Compras** - Agrega productos y gestiona tu pedido
📦 **Categorías Organizadas** - Analgesicos, Antibioticos, Vitaminas y Ofertas
� **Ofertas Especiales** - Descuentos de hasta 30% en productos seleccionados
📱 **Diseño Responsivo** - Funciona perfectamente en móviles y computadoras

## 🚀 Cómo Usar la Plataforma

### 💻 Acceso a la Aplicación
Visita: **http://localhost:3000** en tu navegador favorito

---

## 🐳 Instalación con Docker

### Prerrequisitos

Antes de comenzar, asegúrate de tener instalado:

- **Docker Desktop** (incluye Docker y Docker Compose)
  - [Descargar para Windows](https://www.docker.com/products/docker-desktop/)
  - [Descargar para Mac](https://www.docker.com/products/docker-desktop/)
  - [Descargar para Linux](https://docs.docker.com/desktop/install/linux-install/)
- **Git** (para clonar el repositorio)
  - [Descargar Git](https://git-scm.com/downloads)

### 🚀 Instalación Rápida

#### 1️⃣ Clonar el Repositorio

```bash
git clone https://github.com/Ofchanataxi/proyecto-2P.git
cd proyecto-2P
```

#### 2️⃣ Levantar los Servicios con Docker Compose

```bash
docker-compose up -d
```

Este comando:
- ✅ Descarga las imágenes necesarias (MySQL, Java, Node, Nginx)
- ✅ Construye los 4 microservicios (catálogo, inventario, ventas, frontend)
- ✅ Crea las 3 bases de datos (db_catalogo, db_inventario, db_ventas)
- ✅ Inicializa los datos de ejemplo
- ✅ Levanta todos los servicios en segundo plano

**Tiempo estimado:** 2-5 minutos (primera vez)

#### 3️⃣ Verificar que los Servicios Estén Corriendo

```bash
docker-compose ps
```

Deberías ver 5 contenedores corriendo:
- `mysql-farmacia` (Base de datos)
- `ms-catalogo` (API Catálogo)
- `ms-inventario` (API Inventario)
- `ms-ventas` (API Ventas)
- `ms-frontend` (Aplicación Web)

#### 4️⃣ Acceder a la Aplicación

Espera 30 segundos para que todos los servicios inicien completamente, luego abre:

**🌐 Frontend:** http://localhost:3000

**APIs (opcional):**
- Catálogo: http://localhost:8081/api/medicamentos
- Inventario: http://localhost:8082/api/sucursales
- Ventas: http://localhost:8083/api/ventas

---

### 📋 Comandos Útiles de Docker

#### Ver Logs de los Servicios

```bash
# Ver logs de todos los servicios
docker-compose logs -f

# Ver logs de un servicio específico
docker-compose logs -f ms-frontend
docker-compose logs -f ms-ventas
docker-compose logs -f ms-catalogo
docker-compose logs -f ms-inventario
```

#### Detener los Servicios

```bash
# Detener sin eliminar contenedores
docker-compose stop

# Detener y eliminar contenedores
docker-compose down
```

#### Reiniciar un Servicio Específico

```bash
# Reiniciar el frontend
docker-compose restart ms-frontend

# Reiniciar el servicio de ventas
docker-compose restart ms-ventas
```

#### Reconstruir los Servicios

Si haces cambios en el código:

```bash
# Reconstruir todos los servicios
docker-compose build

# Reconstruir y levantar
docker-compose up -d --build

# Reconstruir solo un servicio
docker-compose build ms-ventas
docker-compose up -d ms-ventas
```

#### Resetear la Base de Datos

```bash
# Detener y eliminar todo (incluyendo volúmenes)
docker-compose down -v

# Volver a levantar (se reinicializará la BD)
docker-compose up -d
```

#### Ver el Estado de los Contenedores

```bash
# Ver contenedores corriendo
docker ps

# Ver todos los contenedores (incluso detenidos)
docker ps -a

# Ver uso de recursos
docker stats
```

---

### 🔧 Solución de Problemas

#### Problema: Los servicios no inician

**Solución:**
```bash
# Detener todo
docker-compose down

# Limpiar volúmenes
docker-compose down -v

# Volver a levantar
docker-compose up -d

# Ver logs para identificar errores
docker-compose logs -f
```

#### Problema: Puerto ya en uso

Si ves un error como "port is already allocated":

**Solución:**
```bash
# Opción 1: Detener el proceso que usa el puerto
# En Windows (PowerShell):
netstat -ano | findstr :3000
taskkill /PID <PID> /F

# Opción 2: Cambiar el puerto en docker-compose.yml
# Edita el archivo y cambia:
ports:
  - "3001:3000"  # En lugar de 3000:3000
```

#### Problema: Error de conexión a la base de datos

**Solución:**
```bash
# Esperar más tiempo (los servicios tardan en iniciar)
# Verificar que MySQL esté healthy:
docker-compose ps

# Si no está healthy, reiniciar:
docker-compose restart mysql-farmacia
```

#### Problema: Cambios en el código no se reflejan

**Solución:**
```bash
# Reconstruir la imagen
docker-compose build ms-frontend  # o el servicio que modificaste
docker-compose up -d

# O reconstruir todo
docker-compose up -d --build
```

---

### 🗂️ Estructura de Servicios

```
Puerto 3000  → Frontend (React)
Puerto 8081  → MS-Catálogo (Spring Boot)
Puerto 8082  → MS-Inventario (Spring Boot)
Puerto 8083  → MS-Ventas (Spring Boot)
Puerto 3307  → MySQL (Base de datos)
```

---

### 📦 Datos de Ejemplo

El sistema viene con datos precargados:

**Medicamentos:** 15 productos en 4 categorías
- Analgésicos (4 productos)
- Antibióticos (4 productos)
- Vitaminas (4 productos)
- Ofertas (3 productos)

**Sucursales:** 4 ubicaciones
- Farmacia Centro
- Farmacia Norte
- Farmacia Sur
- Farmacia Valle

**Inventario:** Stock disponible en todas las sucursales

---

## �️ Guía de Compras

### 🏪 Paso 1: Selecciona tu Sucursal
1. Al ingresar, elige la sucursal más cercana a tu ubicación
2. Todas las sucursales tienen productos disponibles
3. Puedes cambiar de sucursal en cualquier momento

### 🔍 Paso 2: Encuentra tus Medicamentos
**Navega por Categorías:**
- 💊 **Analgesicos** - Para aliviar el dolor (Paracetamol, Ibuprofeno, etc.)
- 🦠 **Antibioticos** - Para infecciones (bajo prescripción médica)
- 🌿 **Vitaminas** - Suplementos nutricionales
- 🎁 **Ofertas** - Productos con descuentos especiales

**O usa la Búsqueda:**
- Escribe el nombre del medicamento
- Busca por laboratorio (Bayer, Pfizer, etc.)
- Usa códigos de barras

### 🛒 Paso 3: Agrega al Carrito
1. Haz clic en "🛒 Agregar al carrito" en el producto deseado
2. Verás una confirmación verde cuando se agregue exitosamente
3. Los productos en oferta tienen un badge rojo "¡OFERTA!"

### 💳 Paso 4: Finaliza tu Compra
1. Ve a tu carrito haciendo clic en "🛒 Carrito"
2. Revisa tus productos y cantidades
3. Completa tus datos personales
4. Confirma tu pedido

## 🎯 Funcionalidades Destacadas

### 🔥 Sistema de Ofertas Inteligente
- Productos con precios menores a $5.00 automáticamente en oferta
- Banner promocional con descuentos hasta 30%
- Badges visuales en productos en promoción

### 🎨 Experiencia Visual Mejorada
- Iconos específicos para cada categoría
- Animaciones suaves al cargar productos
- Notificaciones visuales al agregar al carrito
- Diseño moderno y amigable

### 📱 Totalmente Responsivo
- Funciona perfectamente en smartphones
- Adaptado para tablets
- Optimizado para computadoras de escritorio

## 🌍 Disponibilidad y Cobertura

### 🕒 Horario de Atención
- **24 horas, 7 días de la semana**
- Servicio en línea siempre disponible
- Soporte técnico: **1800-FARMACIA**

### 📞 Contacto
- **Teléfono:** 1800-FARMACIA
- **Email:** info@farmacia.com
- **Soporte en línea:** Disponible 24/7

## � ¿Por Qué Elegirnos?

### ✅ Confianza y Seguridad
- Medicamentos de laboratorios certificados
- Precios transparentes sin sorpresas
- Información detallada de cada producto
- Compra segura con confirmación inmediata

### ⚡ Rapidez y Conveniencia
- **Búsqueda instantánea** - Encuentra lo que necesitas en segundos
- **Carrito inteligente** - Guarda tus productos favoritos
- **Múltiples ubicaciones** - Elige la sucursal más cercana
- **Interfaz intuitiva** - Fácil de usar para todas las edades

### 💰 Ofertas y Precios Competitivos
- **Ofertas especiales** claramente marcadas
- **Descuentos hasta 30%** en productos seleccionados
- **Precios accesibles** en medicamentos básicos
- **Productos desde $2.50** en nuestra sección de ofertas

## 🛡️ Compromiso con tu Salud

Tu bienestar es nuestra máxima prioridad. Por eso:

- ✅ Solo trabajamos con **laboratorios reconocidos**
- ✅ Mantenemos **inventario actualizado** en tiempo real
- ✅ Ofrecemos **información completa** de cada medicamento
- ✅ Garantizamos **productos auténticos** y en buen estado

## 💻 Requisitos del Sistema

### Para Usuarios
- **Navegador web moderno** (Chrome, Firefox, Safari, Edge)
- **Conexión a internet** estable
- **JavaScript habilitado**

### Dispositivos Compatibles
- 📱 **Smartphones** (iOS y Android)
- 💻 **Computadoras** (Windows, Mac, Linux)
- 📱 **Tablets** (iPad, Android tablets)

## � Tecnología de Vanguardia

Nuestra plataforma utiliza las tecnologías más modernas para ofrecerte:

- **Carga rápida** de páginas y productos
- **Búsqueda inteligente** con resultados instantáneos
- **Interfaz responsiva** que se adapta a tu dispositivo
- **Notificaciones visuales** para una mejor experiencia
- **Navegación fluida** entre categorías y productos

---

### 🎯 ¡Comienza Ahora!

**¿Listo para probar Farmacia Online?**

1. 🌐 Visita **http://localhost:3000**
2. 🏪 Selecciona tu sucursal preferida
3. 🔍 Busca o navega por nuestros productos
4. 🛒 Agrega al carrito lo que necesites
5. ✅ Finaliza tu compra en minutos

**Tu salud, nuestra prioridad. Tu comodidad, nuestra misión.** 💙

---

*© 2024 Farmacia Online - Todos los derechos reservados*
- [ ] Integración con pasarelas de pago
- [ ] App móvil nativa

## 📞 Soporte

Si necesitas ayuda:
1. Revisa los logs de Docker
2. Verifica que todos los servicios estén corriendo
3. Asegúrate de que los puertos no estén ocupados

---

## ✅ ¡Todo Listo!

Tu sistema de farmacia está completamente funcional y listo para usar.
Abre http://localhost:3000 y comienza a explorar! 🚀
