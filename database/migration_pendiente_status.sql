-- Migración: Agregar estado 'pendiente' a la tabla prestamo
-- Los préstamos pendientes son solicitados por usuarios y esperan aprobación del admin

ALTER TABLE prestamo
  MODIFY COLUMN estado ENUM('activo', 'devuelto', 'vencido', 'pendiente') NOT NULL DEFAULT 'activo';
