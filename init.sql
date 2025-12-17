CREATE DATABASE IF NOT EXISTS db_catalogo CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
CREATE DATABASE IF NOT EXISTS db_inventario CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
CREATE DATABASE IF NOT EXISTS db_ventas CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- ==========================================
-- DATOS INICIALES PARA db_catalogo
-- ==========================================
USE db_catalogo;

-- Crear tabla medicamentos (si no existe ya por JPA)
CREATE TABLE IF NOT EXISTS medicamentos (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    nombre VARCHAR(100) NOT NULL,
    codigo_barra VARCHAR(50) UNIQUE NOT NULL,
    laboratorio VARCHAR(100) NOT NULL,
    precio_unitario DECIMAL(10,2) NOT NULL,
    categoria VARCHAR(50),
    imagen_url VARCHAR(500)
)
ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Insertar medicamentos de ejemplo con categorías e imágenes
INSERT INTO medicamentos (nombre, codigo_barra, laboratorio, precio_unitario, categoria, imagen_url) VALUES
-- Analgésicos
('Paracetamol 500mg', '7501234567890', 'Bayer', 3.50, 'Analgésicos', 'https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?w=400'),
('Ibuprofeno 400mg', '7501234567891', 'Pfizer', 5.25, 'Analgésicos', 'https://images.unsplash.com/photo-1587854692152-cbe660dbde88?w=400'),
('Aspirina 100mg', '7501234567892', 'Bayer', 4.00, 'Analgésicos', 'https://images.unsplash.com/photo-1584017911766-d451b3d0e843?w=400'),
('Naproxeno 250mg', '7501234567893', 'Genfar', 6.75, 'Analgésicos', 'https://images.unsplash.com/photo-1471864190281-a93a3070b6de?w=400'),

-- Antibióticos
('Amoxicilina 500mg', '7501234567894', 'GlaxoSmithKline', 12.50, 'Antibióticos', 'https://images.unsplash.com/photo-1631549916768-4119b2e5f926?w=400'),
('Azitromicina 500mg', '7501234567895', 'Pfizer', 15.00, 'Antibióticos', 'https://images.unsplash.com/photo-1587854692152-cbe660dbde88?w=400'),
('Ciprofloxacino 500mg', '7501234567896', 'Bayer', 18.00, 'Antibióticos', 'https://images.unsplash.com/photo-1550572017-edd951aa8f72?w=400'),
('Cefalexina 500mg', '7501234567897', 'Abbott', 14.25, 'Antibióticos', 'https://images.unsplash.com/photo-1585435557343-3b092031a831?w=400'),

-- Vitaminas
('Vitamina C 1000mg', '7501234567898', 'Nature Made', 8.50, 'Vitaminas', 'https://images.unsplash.com/photo-1607619056574-7b8d3ee536b2?w=400'),
('Vitamina D3 2000 UI', '7501234567899', 'Nature Made', 10.00, 'Vitaminas', 'https://images.unsplash.com/photo-1526792060691-9b63e34d3667?w=400'),
('Complejo B', '7501234567800', 'Centrum', 12.00, 'Vitaminas', 'https://images.unsplash.com/photo-1621791748377-031c218e2ace?w=400'),
('Multivitamínico Centrum', '7501234567801', 'Centrum', 22.50, 'Vitaminas', 'https://images.unsplash.com/photo-1550572017-edd951aa8f72?w=400'),

-- Ofertas
('Omeprazol 20mg', '7501234567802', 'AstraZeneca', 7.50, 'Ofertas', 'https://images.unsplash.com/photo-1587854692152-cbe660dbde88?w=400'),
('Loratadina 10mg', '7501234567803', 'Bayer', 5.00, 'Ofertas', 'https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?w=400'),
('Metamizol 500mg', '7501234567804', 'Genfar', 4.50, 'Ofertas', 'https://images.unsplash.com/photo-1471864190281-a93a3070b6de?w=400');

-- ==========================================
-- DATOS INICIALES PARA db_inventario
-- ==========================================
USE db_inventario;

-- Crear tabla sucursales
CREATE TABLE IF NOT EXISTS sucursales (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    nombre VARCHAR(100) NOT NULL,
    direccion VARCHAR(200) NOT NULL,
    telefono VARCHAR(20)
);

-- Insertar sucursales de ejemplo
INSERT INTO sucursales (nombre, direccion, telefono) VALUES
('Farmacia Centro', 'Av. Amazonas y Naciones Unidas', '0223456789'),
('Farmacia Norte', 'Av. 6 de Diciembre y Eloy Alfaro', '0223456780'),
('Farmacia Sur', 'Av. Mariscal Sucre y Quitumbe', '0223456781'),
('Farmacia Valle', 'Av. Interoceánica Km 2.5', '0223456782');

-- Crear tabla inventarios
CREATE TABLE IF NOT EXISTS inventarios (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    medicamento_id BIGINT NOT NULL,
    sucursal_id BIGINT NOT NULL,
    cantidad INT NOT NULL DEFAULT 0,
    FOREIGN KEY (sucursal_id) REFERENCES sucursales(id)
);

-- Insertar inventario inicial (medicamentos 1-15 en las 4 sucursales)
INSERT INTO inventarios (medicamento_id, sucursal_id, cantidad) VALUES
-- Sucursal Centro (id=1)
(1, 1, 100), (2, 1, 80), (3, 1, 60), (4, 1, 50),
(5, 1, 40), (6, 1, 35), (7, 1, 30), (8, 1, 45),
(9, 1, 90), (10, 1, 70), (11, 1, 65), (12, 1, 55),
(13, 1, 50), (14, 1, 75), (15, 1, 85),
-- Sucursal Norte (id=2)
(1, 2, 120), (2, 2, 90), (3, 2, 70), (4, 2, 60),
(5, 2, 50), (6, 2, 45), (7, 2, 40), (8, 2, 55),
(9, 2, 100), (10, 2, 80), (11, 2, 75), (12, 2, 65),
(13, 2, 60), (14, 2, 85), (15, 2, 95),
-- Sucursal Sur (id=3)
(1, 3, 80), (2, 3, 60), (3, 3, 50), (4, 3, 40),
(5, 3, 30), (6, 3, 25), (7, 3, 20), (8, 3, 35),
(9, 3, 70), (10, 3, 60), (11, 3, 55), (12, 3, 45),
(13, 3, 40), (14, 3, 65), (15, 3, 75),
-- Sucursal Valle (id=4)
(1, 4, 110), (2, 4, 85), (3, 4, 65), (4, 4, 55),
(5, 4, 45), (6, 4, 40), (7, 4, 35), (8, 4, 50),
(9, 4, 95), (10, 4, 75), (11, 4, 70), (12, 4, 60),
(13, 4, 55), (14, 4, 80), (15, 4, 90);

-- ==========================================
-- DATOS INICIALES PARA db_ventas
-- ==========================================
USE db_ventas;

-- Crear tabla clientes
CREATE TABLE IF NOT EXISTS clientes (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    nombre VARCHAR(100) NOT NULL,
    cedula VARCHAR(10) NOT NULL,
    direccion VARCHAR(200),
    email VARCHAR(100),
    telefono VARCHAR(10)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Crear tabla ventas
CREATE TABLE IF NOT EXISTS ventas (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    cliente_id BIGINT,
    sucursal_id BIGINT NOT NULL,
    fecha TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    total DECIMAL(10,2) NOT NULL,
    FOREIGN KEY (cliente_id) REFERENCES clientes(id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Crear tabla detalles_venta
CREATE TABLE IF NOT EXISTS detalles_venta (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    venta_id BIGINT NOT NULL,
    medicamento_id BIGINT NOT NULL,
    cantidad INT NOT NULL,
    precio_unitario DECIMAL(10,2) NOT NULL,
    subtotal DECIMAL(10,2) NOT NULL,
    FOREIGN KEY (venta_id) REFERENCES ventas(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;