-- ============================================
-- Base de datos: biblioteca
-- ============================================

SET NAMES utf8mb4;

CREATE DATABASE IF NOT EXISTS biblioteca
  CHARACTER SET utf8mb4
  COLLATE utf8mb4_unicode_ci;
USE biblioteca;

-- ============================================
-- Tabla: usuario
-- ============================================
CREATE TABLE IF NOT EXISTS usuario (
    id INT AUTO_INCREMENT PRIMARY KEY,
    nombre VARCHAR(100) NOT NULL,
    email VARCHAR(100) NOT NULL UNIQUE,
    telefono VARCHAR(20),
    direccion VARCHAR(200),
    contrasena VARCHAR(255) NOT NULL,
    rol ENUM('admin', 'user', 'bibliotecario') NOT NULL DEFAULT 'user',
    fecha_registro TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ============================================
-- Tabla: libros
-- ============================================
CREATE TABLE IF NOT EXISTS libros (
    id INT AUTO_INCREMENT PRIMARY KEY,
    titulo VARCHAR(200) NOT NULL,
    autor VARCHAR(100) NOT NULL,
    isbn VARCHAR(20) NOT NULL UNIQUE,
    editorial VARCHAR(100),
    anio_publicacion SMALLINT,
    genero VARCHAR(50),
    cantidad_disponible INT NOT NULL DEFAULT 1,
    portada VARCHAR(500)
);

-- ============================================
-- Tabla: prestamo
-- ============================================
CREATE TABLE IF NOT EXISTS prestamo (
    id INT AUTO_INCREMENT PRIMARY KEY,
    usuario_id INT NOT NULL,
    fecha_prestamo DATE NOT NULL,
    fecha_devolucion DATE NOT NULL,
    estado ENUM('activo', 'devuelto', 'vencido') NOT NULL DEFAULT 'activo',
    FOREIGN KEY (usuario_id) REFERENCES usuario(id)
        ON DELETE CASCADE
        ON UPDATE CASCADE
);

-- ============================================
-- Tabla: detalle_prestamo
-- ============================================
CREATE TABLE IF NOT EXISTS detalle_prestamo (
    id INT AUTO_INCREMENT PRIMARY KEY,
    prestamo_id INT NOT NULL,
    libro_id INT NOT NULL,
    cantidad INT NOT NULL DEFAULT 1,
    FOREIGN KEY (prestamo_id) REFERENCES prestamo(id)
        ON DELETE CASCADE
        ON UPDATE CASCADE,
    FOREIGN KEY (libro_id) REFERENCES libros(id)
        ON DELETE CASCADE
        ON UPDATE CASCADE
);

-- ============================================
-- Datos de prueba (opcional)
-- Contraseña por defecto de los usuarios de prueba: biblioteca123
-- ============================================
INSERT INTO usuario (nombre, email, telefono, direccion, contrasena, rol) VALUES
('Juan Pérez', 'juan@email.com', '555-0101', 'Calle Mayor 1', '$2b$10$guYrDLvqpcTlRryiaJywK.JTxrFozPJPJkSSMuwPBjvr6rXVHI3bO', 'user'),
('María García', 'maria@email.com', '555-0102', 'Avenida Libertad 22', '$2b$10$guYrDLvqpcTlRryiaJywK.JTxrFozPJPJkSSMuwPBjvr6rXVHI3bO', 'user'),
('Carlos López', 'carlos@email.com', '555-0103', 'Plaza España 5', '$2b$10$guYrDLvqpcTlRryiaJywK.JTxrFozPJPJkSSMuwPBjvr6rXVHI3bO', 'user');

INSERT INTO libros (titulo, autor, isbn, editorial, anio_publicacion, genero, cantidad_disponible) VALUES
('Cien Años de Soledad', 'Gabriel García Márquez', '978-0307474728', 'Sudamericana', 1967, 'Realismo mágico', 5),
('Don Quijote de la Mancha', 'Miguel de Cervantes', '978-8420412146', 'Juan de la Cuesta', 1605, 'Novela', 3),
('El Principito', 'Antoine de Saint-Exupéry', '978-0156012195', 'Reynal & Hitchcock', 1943, 'Fábula', 7);
