-- ============================================
-- Seed "Catálogo completo": sube a la BD todos los libros de la interfaz
-- y garantiza un mínimo de 5 ejemplares por género.
-- Corrección de portadas en blanco (ISBN que Open Library no tenía cubierta).
-- Idempotente: se puede ejecutar varias veces sin romper nada.
-- Compatible con MariaDB / MySQL 8+.
-- ============================================

USE biblioteca;

SET NAMES utf8mb4;

-- 1) Garantizar la columna portada (por si la BD es antigua)
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

-- 2) FIX portadas en blanco: cambiar a ISOBN válido en Open Library
UPDATE libros SET isbn = '978-0060883287',
  portada = 'https://covers.openlibrary.org/b/isbn/978-0060883287-L.jpg'
WHERE isbn = '978-0307474728';

UPDATE libros SET isbn = '978-0060850524',
  portada = 'https://covers.openlibrary.org/b/isbn/978-0060850524-L.jpg'
WHERE isbn = '978-0307477421';

-- 3) Catálogo ampliado (mínimo 5 por género)
INSERT INTO libros (titulo, autor, isbn, editorial, anio_publicacion, genero, cantidad_disponible, portada) VALUES
/* Novela */
('El gran Gatsby', 'F. Scott Fitzgerald', '978-0743273565', 'Biblioteca', 1925, 'Novela', 3, 'https://covers.openlibrary.org/b/isbn/978-0743273565-L.jpg'),
('Matar a un ruiseñor', 'Harper Lee', '978-0446310789', 'Biblioteca', 1960, 'Novela', 3, 'https://covers.openlibrary.org/b/isbn/978-0446310789-L.jpg'),
('El viejo y el mar', 'Ernest Hemingway', '978-0684801223', 'Biblioteca', 1952, 'Novela', 3, 'https://covers.openlibrary.org/b/isbn/978-0684801223-L.jpg'),
('La insoportable levedad del ser', 'Milan Kundera', '978-0060932138', 'Biblioteca', 1984, 'Novela', 3, 'https://covers.openlibrary.org/b/isbn/978-0060932138-L.jpg'),
('Guerra y paz', 'León Tolstói', '978-1400079988', 'Biblioteca', 1869, 'Novela', 3, 'https://covers.openlibrary.org/b/isbn/978-1400079988-L.jpg'),
/* Distopía */
('Fahrenheit 451', 'Ray Bradbury', '978-1451673319', 'Biblioteca', 1953, 'Distopía', 3, 'https://covers.openlibrary.org/b/isbn/978-1451673319-L.jpg'),
('El cuento de la criada', 'Margaret Atwood', '978-0385490818', 'Biblioteca', 1985, 'Distopía', 3, 'https://covers.openlibrary.org/b/isbn/978-0385490818-L.jpg'),
('Matadero cinco', 'Kurt Vonnegut', '978-0385333849', 'Biblioteca', 1969, 'Distopía', 3, 'https://covers.openlibrary.org/b/isbn/978-0385333849-L.jpg'),
/* Fantasía */
('La Comunidad del Anillo', 'J.R.R. Tolkien', '978-0618640157', 'Biblioteca', 1954, 'Fantasía', 3, 'https://covers.openlibrary.org/b/isbn/978-0618640157-L.jpg'),
('Harry Potter y la piedra filosofal', 'J.K. Rowling', '978-0439064873', 'Biblioteca', 1997, 'Fantasía', 3, 'https://covers.openlibrary.org/b/isbn/978-0439064873-L.jpg'),
('Los juegos del hambre', 'Suzanne Collins', '978-0439023481', 'Biblioteca', 2008, 'Fantasía', 3, 'https://covers.openlibrary.org/b/isbn/978-0439023481-L.jpg'),
('El león, la bruja y el armario', 'C.S. Lewis', '978-0060764890', 'Biblioteca', 1950, 'Fantasía', 3, 'https://covers.openlibrary.org/b/isbn/978-0060764890-L.jpg'),
/* Fábula */
('Fábulas de Esopo', 'Esopo', '978-0140446494', 'Biblioteca', -560, 'Fábula', 3, 'https://covers.openlibrary.org/b/isbn/978-0140446494-L.jpg'),
('Alicia en el país de las maravillas', 'Lewis Carroll', '978-0141439761', 'Biblioteca', 1865, 'Fábula', 3, 'https://covers.openlibrary.org/b/isbn/978-0141439761-L.jpg'),
('El maravilloso mago de Oz', 'L. Frank Baum', '978-0142417515', 'Biblioteca', 1900, 'Fábula', 3, 'https://covers.openlibrary.org/b/isbn/978-0142417515-L.jpg'),
('Peter Pan', 'J.M. Barrie', '978-0142400982', 'Biblioteca', 1911, 'Fábula', 3, 'https://covers.openlibrary.org/b/isbn/978-0142400982-L.jpg'),
/* Romance */
('Cumbres borrascosas', 'Emily Brontë', '978-0141439556', 'Biblioteca', 1847, 'Romance', 3, 'https://covers.openlibrary.org/b/isbn/978-0141439556-L.jpg'),
('Romeo y Julieta', 'William Shakespeare', '978-0743477116', 'Biblioteca', 1597, 'Romance', 3, 'https://covers.openlibrary.org/b/isbn/978-0743477116-L.jpg'),
('Persuasión', 'Jane Austen', '978-0141439686', 'Biblioteca', 1817, 'Romance', 3, 'https://covers.openlibrary.org/b/isbn/978-0141439686-L.jpg'),
('Sentido y sensibilidad', 'Jane Austen', '978-0141439662', 'Biblioteca', 1811, 'Romance', 3, 'https://covers.openlibrary.org/b/isbn/978-0141439662-L.jpg'),
/* Clásico */
('El retrato de Dorian Gray', 'Oscar Wilde', '978-0141439570', 'Biblioteca', 1890, 'Clásico', 3, 'https://covers.openlibrary.org/b/isbn/978-0141439570-L.jpg'),
('Anna Karenina', 'León Tolstói', '978-0143035008', 'Biblioteca', 1878, 'Clásico', 3, 'https://covers.openlibrary.org/b/isbn/978-0143035008-L.jpg'),
('Los hermanos Karamazov', 'Fiódor Dostoievski', '978-0374528379', 'Biblioteca', 1880, 'Clásico', 3, 'https://covers.openlibrary.org/b/isbn/978-0374528379-L.jpg'),
('Middlemarch', 'George Eliot', '978-0141439549', 'Biblioteca', 1871, 'Clásico', 3, 'https://covers.openlibrary.org/b/isbn/978-0141439549-L.jpg'),
/* Realismo */
('El lobo estepario', 'Hermann Hesse', '978-0312278670', 'Biblioteca', 1927, 'Realismo', 3, 'https://covers.openlibrary.org/b/isbn/978-0312278670-L.jpg'),
('Madame Bovary', 'Gustave Flaubert', '978-0199535651', 'Biblioteca', 1856, 'Realismo', 3, 'https://covers.openlibrary.org/b/isbn/978-0199535651-L.jpg'),
('Fiesta (El sol también se levanta)', 'Ernest Hemingway', '978-0143059165', 'Biblioteca', 1926, 'Realismo', 3, 'https://covers.openlibrary.org/b/isbn/978-0143059165-L.jpg'),
('Al faro', 'Virginia Woolf', '978-0141187761', 'Biblioteca', 1927, 'Realismo', 3, 'https://covers.openlibrary.org/b/isbn/978-0141187761-L.jpg'),
/* Realismo Mágico */
('El amor en los tiempos del cólera', 'Gabriel García Márquez', '978-0679783268', 'Biblioteca', 1985, 'Realismo Mágico', 3, 'https://covers.openlibrary.org/b/isbn/978-0679783268-L.jpg'),
('Crónica de una muerte anunciada', 'Gabriel García Márquez', '978-1400034956', 'Biblioteca', 1981, 'Realismo Mágico', 3, 'https://covers.openlibrary.org/b/isbn/978-1400034956-L.jpg'),
('Como agua para chocolate', 'Laura Esquivel', '978-0307474520', 'Biblioteca', 1989, 'Realismo Mágico', 3, 'https://covers.openlibrary.org/b/isbn/978-0307474520-L.jpg'),
('La casa de los espíritus', 'Isabel Allende', '978-0060914110', 'Biblioteca', 1982, 'Realismo Mágico', 3, 'https://covers.openlibrary.org/b/isbn/978-0060914110-L.jpg'),
/* Misterio */
('El código Da Vinci', 'Dan Brown', '978-0307474278', 'Biblioteca', 2003, 'Misterio', 3, 'https://covers.openlibrary.org/b/isbn/978-0307474278-L.jpg'),
('Las aventuras de Sherlock Holmes', 'Arthur Conan Doyle', '978-0140439083', 'Biblioteca', 1892, 'Misterio', 3, 'https://covers.openlibrary.org/b/isbn/978-0140439083-L.jpg'),
('Y no quedó ninguno', 'Agatha Christie', '978-0062073488', 'Biblioteca', 1939, 'Misterio', 3, 'https://covers.openlibrary.org/b/isbn/978-0062073488-L.jpg'),
('Asesinato en el Orient Express', 'Agatha Christie', '978-0062073495', 'Biblioteca', 1934, 'Misterio', 3, 'https://covers.openlibrary.org/b/isbn/978-0062073495-L.jpg'),
/* Aventura */
('La isla del tesoro', 'Robert L. Stevenson', '978-0141321004', 'Biblioteca', 1883, 'Aventura', 3, 'https://covers.openlibrary.org/b/isbn/978-0141321004-L.jpg'),
('Viaje al centro de la Tierra', 'Jules Verne', '978-0141439914', 'Biblioteca', 1864, 'Aventura', 3, 'https://covers.openlibrary.org/b/isbn/978-0141439914-L.jpg'),
('El corazón de las tinieblas', 'Joseph Conrad', '978-0141441672', 'Biblioteca', 1899, 'Aventura', 3, 'https://covers.openlibrary.org/b/isbn/978-0141441672-L.jpg'),
('La vuelta al mundo en 80 días', 'Jules Verne', '978-0141439990', 'Biblioteca', 1873, 'Aventura', 3, 'https://covers.openlibrary.org/b/isbn/978-0141439990-L.jpg'),
/* Épica */
('La Ilíada', 'Homero', '978-0140275360', 'Biblioteca', -750, 'Épica', 3, 'https://covers.openlibrary.org/b/isbn/978-0140275360-L.jpg'),
('Beowulf', 'Anónimo', '978-0140449310', 'Biblioteca', 700, 'Épica', 3, 'https://covers.openlibrary.org/b/isbn/978-0140449310-L.jpg'),
('La Eneida', 'Virgilio', '978-0140449525', 'Biblioteca', -19, 'Épica', 3, 'https://covers.openlibrary.org/b/isbn/978-0140449525-L.jpg'),
('Gargantúa y Pantagruel', 'François Rabelais', '978-0140440263', 'Biblioteca', 1534, 'Épica', 3, 'https://covers.openlibrary.org/b/isbn/978-0140440263-L.jpg'),
/* Ciencia Ficción */
('Dune', 'Frank Herbert', '978-0441172719', 'Biblioteca', 1965, 'Ciencia Ficción', 3, 'https://covers.openlibrary.org/b/isbn/978-0441172719-L.jpg'),
('Fundación', 'Isaac Asimov', '978-0553293357', 'Biblioteca', 1951, 'Ciencia Ficción', 3, 'https://covers.openlibrary.org/b/isbn/978-0553293357-L.jpg'),
('Neuromante', 'William Gibson', '978-0441569595', 'Biblioteca', 1984, 'Ciencia Ficción', 3, 'https://covers.openlibrary.org/b/isbn/978-0441569595-L.jpg'),
('Hyperion', 'Dan Simmons', '978-0345453747', 'Biblioteca', 1989, 'Ciencia Ficción', 3, 'https://covers.openlibrary.org/b/isbn/978-0345453747-L.jpg'),
/* Terror */
('Drácula', 'Bram Stoker', '978-0141439846', 'Biblioteca', 1897, 'Terror', 3, 'https://covers.openlibrary.org/b/isbn/978-0141439846-L.jpg'),
('Frankenstein', 'Mary Shelley', '978-0141439471', 'Biblioteca', 1818, 'Terror', 3, 'https://covers.openlibrary.org/b/isbn/978-0141439471-L.jpg'),
('El resplandor', 'Stephen King', '978-1501142970', 'Biblioteca', 1977, 'Terror', 3, 'https://covers.openlibrary.org/b/isbn/978-1501142970-L.jpg'),
('Carrie', 'Stephen King', '978-0307743664', 'Biblioteca', 1974, 'Terror', 3, 'https://covers.openlibrary.org/b/isbn/978-0307743664-L.jpg'),
/* Thriller */
('La chica del tren', 'Paula Hawkins', '978-1594634024', 'Biblioteca', 2015, 'Thriller', 3, 'https://covers.openlibrary.org/b/isbn/978-1594634024-L.jpg'),
('El silencio de los corderos', 'Thomas Harris', '978-0312924584', 'Biblioteca', 1988, 'Thriller', 3, 'https://covers.openlibrary.org/b/isbn/978-0312924584-L.jpg'),
('La verdad sobre el caso Harry Quebert', 'Joël Dicker', '978-1250067050', 'Biblioteca', 2012, 'Thriller', 3, 'https://covers.openlibrary.org/b/isbn/978-1250067050-L.jpg'),
('Perdida', 'Gillian Flynn', '978-0307588364', 'Biblioteca', 2012, 'Thriller', 3, 'https://covers.openlibrary.org/b/isbn/978-0307588364-L.jpg')
ON DUPLICATE KEY UPDATE
  titulo = VALUES(titulo),
  autor = VALUES(autor),
  editorial = VALUES(editorial),
  anio_publicacion = VALUES(anio_publicacion),
  genero = VALUES(genero),
  cantidad_disponible = VALUES(cantidad_disponible),
  portada = VALUES(portada);