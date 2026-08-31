-- ============================================
-- Seed "WOW": columna portada + datos de demo enriquecidos
-- Idempotente: se puede ejecutar varias veces sin romper nada.
-- Compatible con MariaDB / MySQL 8+ (ADD COLUMN IF NOT EXISTS).
-- ============================================

USE biblioteca;

SET NAMES utf8mb4;

-- 1) Agregar la columna portada a la tabla libros (si no existe)
-- Se usa PREPARE + information_schema para que funcione en MySQL 8 y MariaDB.
SET @existe := (
  SELECT COUNT(*) FROM information_schema.COLUMNS
  WHERE TABLE_SCHEMA = 'biblioteca' AND TABLE_NAME = 'libros' AND COLUMN_NAME = 'portada'
);
SET @sql := IF(@existe = 0,
  'ALTER TABLE libros ADD COLUMN portada VARCHAR(500) AFTER cantidad_disponible',
  'SELECT 1'
);
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- 2) Portadas para los libros por defecto (Open Library, cubiertas públicas)
UPDATE libros SET portada = 'https://covers.openlibrary.org/b/isbn/978-0307474728-L.jpg' WHERE isbn = '978-0307474728' AND (portada IS NULL OR portada = '');
UPDATE libros SET portada = 'https://covers.openlibrary.org/b/isbn/978-8420412146-L.jpg' WHERE isbn = '978-8420412146' AND (portada IS NULL OR portada = '');
UPDATE libros SET portada = 'https://covers.openlibrary.org/b/isbn/978-0156012195-L.jpg' WHERE isbn = '978-0156012195' AND (portada IS NULL OR portada = '');

-- 3) Más libros de ejemplo (INSERT ... ON DUPLICATE KEY para no duplicar por ISBN)
INSERT INTO libros (titulo, autor, isbn, editorial, anio_publicacion, genero, cantidad_disponible, portada) VALUES
('1984', 'George Orwell', '978-0451524935', 'Signet Classic', 1949, 'Distopia', 6, 'https://covers.openlibrary.org/b/isbn/978-0451524935-L.jpg'),
('Crimen y castigo', 'Fiodor Dostoievski', '978-0143058144', 'Penguin Classics', 1866, 'Clasico', 4, 'https://covers.openlibrary.org/b/isbn/978-0143058144-L.jpg'),
('Orgullo y prejuicio', 'Jane Austen', '978-0141439518', 'Penguin Classics', 1813, 'Romance', 5, 'https://covers.openlibrary.org/b/isbn/978-0141439518-L.jpg'),
('El Hobbit', 'J.R.R. Tolkien', '978-0547928227', 'Mariner Books', 1937, 'Fantasia', 3, 'https://covers.openlibrary.org/b/isbn/978-0547928227-L.jpg'),
('El Principito', 'Antoine de Saint-Exupery', '978-0156012195', 'Reynal & Hitchcock', 1943, 'Fabula', 7, 'https://covers.openlibrary.org/b/isbn/978-0156012195-L.jpg'),
('La Metamorfosis', 'Franz Kafka', '978-0553213690', 'Bantam Classics', 1915, 'Realismo', 4, 'https://covers.openlibrary.org/b/isbn/978-0553213690-L.jpg'),
('Rayuela', 'Julio Cortazar', '978-8437604573', 'Catedra', 1963, 'Novela', 4, 'https://covers.openlibrary.org/b/isbn/978-8437604573-L.jpg')
ON DUPLICATE KEY UPDATE portada = VALUES(portada);
