-- ============================================
-- Seed "Comunidad": reseñas y sugerencias de ejemplo
-- Idempotente: inserta únicamente si las tablas están vacías.
-- Proporciona datos vivos al muro de reseñas y al buzón de sugerencias.
-- ============================================

USE biblioteca;

SET NAMES utf8mb4;

SET @sin_resenas := (SELECT COUNT(*) = 0 FROM resena);
SET @sin_sugerencias := (SELECT COUNT(*) = 0 FROM sugerencia);

-- ============================================
-- Reseñas de ejemplo
-- ============================================
INSERT INTO resena (libro_id, usuario_id, calificacion, comentario, publico_recomendado, fecha_creacion)
SELECT l.id, u.id, 5, 'Una obra maestra que todos deberían leer al menos una vez. La prosa es hermosa y las historias te acompañan mucho después de cerrar el libro.', 'todo', DATE_SUB(NOW(), INTERVAL 12 DAY)
FROM libros l INNER JOIN usuario u ON u.email = 'juan@email.com'
WHERE l.isbn = '978-0060883287' AND @sin_resenas;

INSERT INTO resena (libro_id, usuario_id, calificacion, comentario, publico_recomendado, fecha_creacion)
SELECT l.id, u.id, 4, 'Perfecto para leer en voz alta con niños pequeños. Las ilustraciones que imaginé en mi cabeza fueron maravillosas.', 'ninos', DATE_SUB(NOW(), INTERVAL 9 DAY)
FROM libros l INNER JOIN usuario u ON u.email = 'maria@email.com'
WHERE l.isbn = '978-0156012195' AND @sin_resenas;

INSERT INTO resena (libro_id, usuario_id, calificacion, comentario, publico_recomendado, fecha_creacion)
SELECT l.id, u.id, 5, 'Distopía imprescindible. Da mucho que pensar sobre la vigilancia y la libertad. Ideal para jóvenes que se inician en la ciencia ficción.', 'jovenes', DATE_SUB(NOW(), INTERVAL 6 DAY)
FROM libros l INNER JOIN usuario u ON u.email = 'carlos@email.com'
WHERE l.isbn = '978-0451524935' AND @sin_resenas;

INSERT INTO resena (libro_id, usuario_id, calificacion, comentario, publico_recomendado, fecha_creacion)
SELECT l.id, u.id, 5, 'Una aventura fascinante que despierta la imaginación de chicos y grandes. Lectura ligera y muy entretenida.', 'todo', DATE_SUB(NOW(), INTERVAL 3 DAY)
FROM libros l INNER JOIN usuario u ON u.email = 'juan@email.com'
WHERE l.isbn = '978-0547928227' AND @sin_resenas;

INSERT INTO resena (libro_id, usuario_id, calificacion, comentario, publico_recomendado, fecha_creacion)
SELECT l.id, u.id, 3, 'Historia tierna y nostálgica. Algunas partes son lentas, pero el final deja una reflexión muy bonita sobre la amistad.', 'adultos_mayores', DATE_SUB(NOW(), INTERVAL 1 DAY)
FROM libros l INNER JOIN usuario u ON u.email = 'maria@email.com'
WHERE l.isbn = '978-0307387899' AND @sin_resenas;

-- ============================================
-- Sugerencias de ejemplo ("Los Más Pedidos")
-- ============================================
INSERT INTO sugerencia (usuario_id, titulo, autor, categoria, motivo, estado, fecha_creacion)
SELECT u.id, 'La casa de los espíritus', 'Isabel Allende', 'Realismo mágico', 'Mi abuela lo leía siempre y me encantaría poder compartirlo con ella en la biblioteca.', 'aprobado', DATE_SUB(NOW(), INTERVAL 15 DAY)
FROM usuario u WHERE u.email = 'juan@email.com' AND @sin_sugerencias;

INSERT INTO sugerencia (usuario_id, titulo, autor, categoria, motivo, estado, fecha_creacion)
SELECT u.id, 'Dune', 'Frank Herbert', 'Ciencia ficción', 'A mis hijos les encantaría descubrir esta saga clásica en papel.', 'revision', DATE_SUB(NOW(), INTERVAL 8 DAY)
FROM usuario u WHERE u.email = 'maria@email.com' AND @sin_sugerencias;

INSERT INTO sugerencia (usuario_id, titulo, autor, categoria, motivo, estado, fecha_creacion)
SELECT u.id, 'El principito explicado a los abuelos', 'Anónimo', 'Juvenil', 'Seria una gran idea tener una edición de lectura fácil para el club de adultos mayores.', 'en_biblioteca', DATE_SUB(NOW(), INTERVAL 2 DAY)
FROM usuario u WHERE u.email = 'carlos@email.com' AND @sin_sugerencias;

-- Votos de ejemplo para las sugerencias
INSERT INTO sugerencia_voto (sugerencia_id, usuario_id)
SELECT s.id, u.id
FROM sugerencia s INNER JOIN usuario u ON u.email = 'maria@email.com'
WHERE s.titulo = 'La casa de los espíritus' AND @sin_sugerencias AND NOT EXISTS (
  SELECT 1 FROM sugerencia_voto sv WHERE sv.sugerencia_id = s.id AND sv.usuario_id = u.id
);

INSERT INTO sugerencia_voto (sugerencia_id, usuario_id)
SELECT s.id, u.id
FROM sugerencia s INNER JOIN usuario u ON u.email = 'carlos@email.com'
WHERE s.titulo = 'La casa de los espíritus' AND @sin_sugerencias AND NOT EXISTS (
  SELECT 1 FROM sugerencia_voto sv WHERE sv.sugerencia_id = s.id AND sv.usuario_id = u.id
);

INSERT INTO sugerencia_voto (sugerencia_id, usuario_id)
SELECT s.id, u.id
FROM sugerencia s INNER JOIN usuario u ON u.email = 'juan@email.com'
WHERE s.titulo = 'Dune' AND @sin_sugerencias AND NOT EXISTS (
  SELECT 1 FROM sugerencia_voto sv WHERE sv.sugerencia_id = s.id AND sv.usuario_id = u.id
);