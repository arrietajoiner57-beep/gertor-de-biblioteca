-- ============================================
-- Migración: Agregar rol 'bibliotecario'
-- ============================================

ALTER TABLE usuario
  MODIFY COLUMN rol ENUM('admin', 'user', 'bibliotecario') NOT NULL DEFAULT 'user';
