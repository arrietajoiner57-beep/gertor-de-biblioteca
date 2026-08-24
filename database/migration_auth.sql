-- ============================================
-- Migración: Sistema de autenticación y roles
-- Agrega contrasena (hash) y rol a la tabla usuario
-- No elimina datos existentes
-- ============================================

USE biblioteca;

SET NAMES utf8mb4;

-- Columna de contraseña (hash bcrypt)
ALTER TABLE usuario
  ADD COLUMN IF NOT EXISTS contrasena VARCHAR(255) NOT NULL AFTER direccion;

-- Columna de rol: admin | user
ALTER TABLE usuario
  ADD COLUMN IF NOT EXISTS rol ENUM('admin', 'user') NOT NULL DEFAULT 'user' AFTER contrasena;

-- Los usuarios que ya existían reciben la contraseña por defecto "biblioteca123"
-- (hash bcrypt). Deben cambiarla después de iniciar sesión.
UPDATE usuario
SET contrasena = '$2b$10$guYrDLvqpcTlRryiaJywK.JTxrFozPJPJkSSMuwPBjvr6rXVHI3bO'
WHERE contrasena = '' OR contrasena IS NULL;
