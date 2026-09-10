-- ============================================
-- Migracion: Plataforma de lectura digital
-- ============================================
USE biblioteca;

-- -------------------------------------------
-- 1. Ampliar tabla libros con campos digitales
-- -------------------------------------------
ALTER TABLE libros
  ADD COLUMN archivo_url VARCHAR(500) DEFAULT NULL AFTER portada,
  ADD COLUMN es_digital TINYINT(1) NOT NULL DEFAULT 1 AFTER archivo_url,
  ADD COLUMN formato ENUM('pdf', 'epub') DEFAULT NULL AFTER es_digital,
  ADD COLUMN paginas INT DEFAULT NULL AFTER formato;

-- -------------------------------------------
-- 2. Tabla: progreso_lectura
-- -------------------------------------------
CREATE TABLE IF NOT EXISTS progreso_lectura (
    id INT AUTO_INCREMENT PRIMARY KEY,
    usuario_id INT NOT NULL,
    libro_id INT NOT NULL,
    ultima_pagina INT NOT NULL DEFAULT 1,
    porcentaje_avance FLOAT NOT NULL DEFAULT 0,
    ultimo_leido_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE KEY uq_usuario_libro (usuario_id, libro_id),
    FOREIGN KEY (usuario_id) REFERENCES usuario(id)
        ON DELETE CASCADE ON UPDATE CASCADE,
    FOREIGN KEY (libro_id) REFERENCES libros(id)
        ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- -------------------------------------------
-- 3. Tabla: suscripciones
-- -------------------------------------------
CREATE TABLE IF NOT EXISTS suscripciones (
    id INT AUTO_INCREMENT PRIMARY KEY,
    usuario_id INT NOT NULL,
    plan_type ENUM('basico', 'premium', 'ilimitado') NOT NULL DEFAULT 'basico',
    status ENUM('activa', 'cancelada', 'expirada', 'prueba') NOT NULL DEFAULT 'prueba',
    token_pago VARCHAR(255) DEFAULT NULL COMMENT 'Token de Stripe o MercadoPago',
    provider VARCHAR(30) DEFAULT NULL COMMENT 'stripe | mercadopago',
    monto DECIMAL(10,2) DEFAULT NULL,
    fecha_inicio DATE NOT NULL,
    fecha_fin DATE DEFAULT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (usuario_id) REFERENCES usuario(id)
        ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- -------------------------------------------
-- 4. Tabla: lectura_sesion (tiempo de lectura para gamificacion)
-- -------------------------------------------
CREATE TABLE IF NOT EXISTS lectura_sesion (
    id INT AUTO_INCREMENT PRIMARY KEY,
    usuario_id INT NOT NULL,
    libro_id INT NOT NULL,
    minutos INT NOT NULL DEFAULT 0,
    fecha DATE NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    KEY idx_usuario_fecha (usuario_id, fecha),
    FOREIGN KEY (usuario_id) REFERENCES usuario(id)
        ON DELETE CASCADE ON UPDATE CASCADE,
    FOREIGN KEY (libro_id) REFERENCES libros(id)
        ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
