-- ============================================
-- Migración: Sección Comunidad y Sugerencias
-- Tablas:
--   - resena:     opiniones con calificación por estrellas (1-5)
--   - resena_like: "Me gusta / Útil" a las reseñas de otros lectores
--   - sugerencia:  petición de libros que no existen en el catálogo
--   - sugerencia_voto: upvots de la comunidad ("Los Más Pedidos")
-- No elimina datos existentes.
-- ============================================

USE biblioteca;

SET NAMES utf8mb4;

-- ============================================
-- Tabla: resena
-- ============================================
CREATE TABLE IF NOT EXISTS resena (
    id INT AUTO_INCREMENT PRIMARY KEY,
    libro_id INT NOT NULL,
    usuario_id INT NOT NULL,
    calificacion TINYINT NOT NULL DEFAULT 5,
    comentario TEXT NOT NULL,
    publico_recomendado VARCHAR(50) NOT NULL DEFAULT 'todo',
    fecha_creacion TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT chk_resena_calificacion CHECK (calificacion BETWEEN 1 AND 5),
    FOREIGN KEY (libro_id) REFERENCES libros(id)
        ON DELETE CASCADE
        ON UPDATE CASCADE,
    FOREIGN KEY (usuario_id) REFERENCES usuario(id)
        ON DELETE CASCADE
        ON UPDATE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_resena_libro ON resena (libro_id);
CREATE INDEX IF NOT EXISTS idx_resena_recientes ON resena (fecha_creacion DESC);

-- ============================================
-- Tabla: resena_like ("Me gusta / Útil")
-- ============================================
CREATE TABLE IF NOT EXISTS resena_like (
    id INT AUTO_INCREMENT PRIMARY KEY,
    resena_id INT NOT NULL,
    usuario_id INT NOT NULL,
    fecha_creacion TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    UNIQUE KEY uq_resena_like (resena_id, usuario_id),
    FOREIGN KEY (resena_id) REFERENCES resena(id)
        ON DELETE CASCADE
        ON UPDATE CASCADE,
    FOREIGN KEY (usuario_id) REFERENCES usuario(id)
        ON DELETE CASCADE
        ON UPDATE CASCADE
);

-- ============================================
-- Tabla: sugerencia ("Buzón de Sugerencias")
-- Estados gestionados por la biblioteca:
--   revision      -> En Revisión (ámbar / amarillo)
--   aprobado      -> Aprobado / En Adquisición (azul)
--   en_biblioteca -> ¡Ya en Biblioteca! (verde esmeralda)
-- ============================================
CREATE TABLE IF NOT EXISTS sugerencia (
    id INT AUTO_INCREMENT PRIMARY KEY,
    usuario_id INT NOT NULL,
    titulo VARCHAR(200) NOT NULL,
    autor VARCHAR(150) NOT NULL,
    categoria VARCHAR(100),
    motivo TEXT,
    estado ENUM('revision', 'aprobado', 'en_biblioteca') NOT NULL DEFAULT 'revision',
    fecha_creacion TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (usuario_id) REFERENCES usuario(id)
        ON DELETE CASCADE
        ON UPDATE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_sugerencia_recientes ON sugerencia (fecha_creacion DESC);

-- ============================================
-- Tabla: sugerencia_voto (upvote de la comunidad)
-- ============================================
CREATE TABLE IF NOT EXISTS sugerencia_voto (
    id INT AUTO_INCREMENT PRIMARY KEY,
    sugerencia_id INT NOT NULL,
    usuario_id INT NOT NULL,
    fecha_creacion TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    UNIQUE KEY uq_sugerencia_voto (sugerencia_id, usuario_id),
    FOREIGN KEY (sugerencia_id) REFERENCES sugerencia(id)
        ON DELETE CASCADE
        ON UPDATE CASCADE,
    FOREIGN KEY (usuario_id) REFERENCES usuario(id)
        ON DELETE CASCADE
        ON UPDATE CASCADE
);