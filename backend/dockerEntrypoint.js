const { execSync } = require('child_process');
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

async function main() {
  await esperarDb();

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
