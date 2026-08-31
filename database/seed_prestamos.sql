-- ============================================
-- Seed "WOW": préstamos de ejemplo para la demo
-- Idempotente: solo inserta si la tabla de préstamos está vacía.
-- Proporciona datos vivos al dashboard (activos, pendientes,
-- vencidos y devueltos).
-- Nota: "vencido" en el sistema es un estado CALCULADO
-- (activo cuya fecha_devolucion ya pasó), por eso se guarda
-- como estado 'activo' con fecha pasada.
-- ============================================

USE biblioteca;

-- Capturar UNA VEZ si la tabla está vacía (variable de sesión que
-- no cambia durante el script, a diferencia de NOT EXISTS por fila).
SET @sin_prestamos := (SELECT COUNT(*) = 0 FROM prestamo);
SET @sin_detalles := (SELECT COUNT(*) = 0 FROM detalle_prestamo);

INSERT INTO prestamo (usuario_id, fecha_prestamo, fecha_devolucion, estado)
SELECT u.id, DATE_SUB(CURDATE(), INTERVAL 20 DAY), DATE_SUB(CURDATE(), INTERVAL 6 DAY), 'devuelto'
FROM usuario u WHERE u.email = 'juan@email.com' AND @sin_prestamos;

INSERT INTO prestamo (usuario_id, fecha_prestamo, fecha_devolucion, estado)
SELECT u.id, DATE_SUB(CURDATE(), INTERVAL 8 DAY), DATE_SUB(CURDATE(), INTERVAL 40 DAY), 'activo'
FROM usuario u WHERE u.email = 'juan@email.com' AND @sin_prestamos;

INSERT INTO prestamo (usuario_id, fecha_prestamo, fecha_devolucion, estado)
SELECT u.id, DATE_SUB(CURDATE(), INTERVAL 2 DAY), DATE_ADD(CURDATE(), INTERVAL 12 DAY), 'activo'
FROM usuario u WHERE u.email = 'juan@email.com' AND @sin_prestamos;

INSERT INTO prestamo (usuario_id, fecha_prestamo, fecha_devolucion, estado)
SELECT u.id, CURDATE(), DATE_ADD(CURDATE(), INTERVAL 14 DAY), 'pendiente'
FROM usuario u WHERE u.email = 'maria@email.com' AND @sin_prestamos;

INSERT INTO prestamo (usuario_id, fecha_prestamo, fecha_devolucion, estado)
SELECT u.id, DATE_SUB(CURDATE(), INTERVAL 5 DAY), DATE_ADD(CURDATE(), INTERVAL 9 DAY), 'activo'
FROM usuario u WHERE u.email = 'maria@email.com' AND @sin_prestamos;

INSERT INTO prestamo (usuario_id, fecha_prestamo, fecha_devolucion, estado)
SELECT u.id, DATE_SUB(CURDATE(), INTERVAL 30 DAY), DATE_SUB(CURDATE(), INTERVAL 16 DAY), 'devuelto'
FROM usuario u WHERE u.email = 'carlos@email.com' AND @sin_prestamos;

-- Detalles: estado devuelto usa cantidad 1, activo usa 1, pendiente usa 2
INSERT INTO detalle_prestamo (prestamo_id, libro_id, cantidad)
SELECT p.id, l.id, 1
FROM prestamo p INNER JOIN libros l ON l.isbn = '978-0451524935'
WHERE p.estado = 'devuelto' AND @sin_detalles;

INSERT INTO detalle_prestamo (prestamo_id, libro_id, cantidad)
SELECT p.id, l.id, 2
FROM prestamo p INNER JOIN libros l ON l.isbn = '978-0451524935'
WHERE p.estado = 'pendiente' AND @sin_detalles;

INSERT INTO detalle_prestamo (prestamo_id, libro_id, cantidad)
SELECT p.id, l.id, 1
FROM prestamo p INNER JOIN libros l ON l.isbn = '978-0451524935'
WHERE p.estado = 'activo' AND @sin_detalles;
