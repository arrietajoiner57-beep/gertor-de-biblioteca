const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');
const mysql = require('mysql2/promise');

async function esperarDb() {
  const maxIntentos = 30;
  for (let i = 1; i <= maxIntentos; i++) {
    try {
      const conn = await mysql.createConnection({
        host: process.env.DB_HOST || 'localhost',
        user: process.env.DB_USER || 'root',
        password: process.env.DB_PASSWORD || '',
        port: process.env.DB_PORT || 3306,
        database: process.env.DB_NAME || 'biblioteca'
      });
      // Verificar que el esquema ya fue aplicado (tabla usuario existe)
      await conn.query('SELECT 1 FROM usuario LIMIT 1');
      await conn.end();
      return;
    } catch (e) {
      console.log(`Esperando base de datos... (${i}/${maxIntentos})`);
      await new Promise((r) => setTimeout(r, 2000));
    }
  }
  throw new Error('No se pudo conectar a la base de datos');
}

async function aplicarMigraciones(conn) {
  const [columnas] = await conn.query(
    `SELECT COLUMN_NAME FROM information_schema.COLUMNS
     WHERE TABLE_SCHEMA = ? AND TABLE_NAME = 'libros'`,
    [process.env.DB_NAME || 'biblioteca']
  );
  const nombres = new Set(columnas.map((c) => c.COLUMN_NAME));

  if (!nombres.has('archivo_url') || !nombres.has('es_digital') || !nombres.has('formato')) {
    await conn.query(
      `ALTER TABLE libros
         ADD COLUMN archivo_url VARCHAR(500) DEFAULT NULL AFTER portada,
         ADD COLUMN es_digital TINYINT(1) NOT NULL DEFAULT 1 AFTER archivo_url,
         ADD COLUMN formato ENUM('pdf', 'epub') DEFAULT NULL AFTER es_digital,
         ADD COLUMN paginas INT DEFAULT NULL AFTER formato`
    );
    console.log('Migracion aplicada: columnas digitales en libros');
  }

  const migraciones = [
    `CREATE TABLE IF NOT EXISTS progreso_lectura (
       id INT AUTO_INCREMENT PRIMARY KEY,
       usuario_id INT NOT NULL,
       libro_id INT NOT NULL,
       ultima_pagina INT NOT NULL DEFAULT 1,
       porcentaje_avance FLOAT NOT NULL DEFAULT 0,
       ultimo_leido_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
       created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
       UNIQUE KEY uq_usuario_libro (usuario_id, libro_id),
       FOREIGN KEY (usuario_id) REFERENCES usuario(id) ON DELETE CASCADE ON UPDATE CASCADE,
       FOREIGN KEY (libro_id) REFERENCES libros(id) ON DELETE CASCADE ON UPDATE CASCADE
     ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;`,
    `CREATE TABLE IF NOT EXISTS suscripciones (
       id INT AUTO_INCREMENT PRIMARY KEY,
       usuario_id INT NOT NULL,
       plan_type ENUM('basico', 'premium', 'ilimitado') NOT NULL DEFAULT 'basico',
       status ENUM('activa', 'cancelada', 'expirada', 'prueba') NOT NULL DEFAULT 'prueba',
       token_pago VARCHAR(255) DEFAULT NULL,
       provider VARCHAR(30) DEFAULT NULL,
       monto DECIMAL(10,2) DEFAULT NULL,
       fecha_inicio DATE NOT NULL,
       fecha_fin DATE DEFAULT NULL,
       created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
       updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
       FOREIGN KEY (usuario_id) REFERENCES usuario(id) ON DELETE CASCADE ON UPDATE CASCADE
     ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;`,
    `CREATE TABLE IF NOT EXISTS lectura_sesion (
       id INT AUTO_INCREMENT PRIMARY KEY,
       usuario_id INT NOT NULL,
       libro_id INT NOT NULL,
       minutos INT NOT NULL DEFAULT 0,
       fecha DATE NOT NULL,
       created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
       KEY idx_usuario_fecha (usuario_id, fecha),
       FOREIGN KEY (usuario_id) REFERENCES usuario(id) ON DELETE CASCADE ON UPDATE CASCADE,
       FOREIGN KEY (libro_id) REFERENCES libros(id) ON DELETE CASCADE ON UPDATE CASCADE
     ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;`
  ];

  for (const sql of migraciones) {
    try {
      await conn.query(sql);
    } catch (e) {
      console.log(`Migracion omitida (idempotente): ${e.code}`);
    }
  }
}

async function main() {
  await esperarDb();

  const conn = await mysql.createConnection({
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    port: process.env.DB_PORT || 3306,
    database: process.env.DB_NAME || 'biblioteca'
  });

  await aplicarMigraciones(conn);
  await conn.end();

  // Crear el administrador inicial (idempotente)
  try {
    execSync('node src/scripts/createAdmin.js', { stdio: 'inherit' });
  } catch (e) {
    console.log('Seed de administrador: continuando...');
  }

  // Iniciar el servidor Express
  require('./src/app.js');
}

main().catch((e) => {
  console.error(e.message);
  process.exit(1);
});
