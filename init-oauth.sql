-- Crear tabla de usuarios con OAuth 2.0
CREATE TABLE IF NOT EXISTS usuarios (
    id BIGSERIAL PRIMARY KEY,
    username VARCHAR(50) UNIQUE NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    rol VARCHAR(20) NOT NULL CHECK (rol IN ('ADMIN', 'MEDICO')),
    activo BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Crear índices para optimizar búsquedas
CREATE INDEX idx_username ON usuarios (username);

CREATE INDEX idx_email ON usuarios (email);

CREATE INDEX idx_rol ON usuarios (rol);

-- Insertar usuarios de prueba
-- Contraseña para todos: "admin123" (encriptada con BCrypt)
INSERT INTO
    usuarios (
        username,
        email,
        password,
        rol,
        activo
    )
VALUES (
        'admin',
        'admin@farmacia.com',
        '$2a$10$56jgEk82mDMZNqDJc2n7Eunzx6X.BcWiVToVfbVcJ9h40H0djFFRG',
        'ADMIN',
        TRUE
    ),
    (
        'medico1',
        'medico1@hospital.com',
        '$2a$10$56jgEk82mDMZNqDJc2n7Eunzx6X.BcWiVToVfbVcJ9h40H0djFFRG',
        'MEDICO',
        TRUE
    ),
    (
        'medico2',
        'medico2@hospital.com',
        '$2a$10$56jgEk82mDMZNqDJc2n7Eunzx6X.BcWiVToVfbVcJ9h40H0djFFRG',
        'MEDICO',
        TRUE
    )
ON CONFLICT (username) DO NOTHING;

-- Comentarios sobre la estructura
COMMENT ON TABLE usuarios IS 'Tabla de usuarios con autenticación OAuth 2.0 usando Spring Security';

COMMENT ON COLUMN usuarios.username IS 'Nombre de usuario único para autenticación';

COMMENT ON COLUMN usuarios.email IS 'Correo electrónico único del usuario';

COMMENT ON COLUMN usuarios.password IS 'Contraseña encriptada con BCrypt';

COMMENT ON COLUMN usuarios.rol IS 'Rol del usuario: ADMIN (acceso completo) o MEDICO (solo compras)';

COMMENT ON COLUMN usuarios.activo IS 'Estado del usuario: TRUE = activo, FALSE = inactivo';