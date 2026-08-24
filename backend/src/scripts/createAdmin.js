require('dotenv').config();
const bcrypt = require('bcryptjs');
const pool = require('../config/db');

// Crea el primer administrador usando las variables de entorno del .env:
// ADMIN_NOMBRE, ADMIN_EMAIL, ADMIN_CONTRASENA
async function crearAdmin() {
  const nombre = process.env.ADMIN_NOMBRE || 'Administrador';
  const email = (process.env.ADMIN_EMAIL || '').trim().toLowerCase();
  const contrasena = process.env.ADMIN_CONTRASENA;
  const telefono = process.env.ADMIN_TELEFONO || null;
  const direccion = process.env.ADMIN_DIRECCION || null;

  if (!email || !contrasena) {
    console.error('Define ADMIN_EMAIL y ADMIN_CONTRASENA en backend/.env antes de ejecutar el seed.');
    process.exit(1);
  }

  try {
    const [rows] = await pool.query('SELECT id, rol FROM usuario WHERE email = ?', [email]);

    const hash = await bcrypt.hash(contrasena, 10);

    if (rows.length > 0) {
      await pool.query('UPDATE usuario SET rol = ?, contrasena = ? WHERE id = ?', ['admin', hash, rows[0].id]);
      console.log(`El usuario ${email} ya existía y fue actualizado a administrador.`);
    } else {
      await pool.query(
        'INSERT INTO usuario (nombre, email, telefono, direccion, contrasena, rol) VALUES (?, ?, ?, ?, ?, ?)',
        [nombre, email, telefono, direccion, hash, 'admin']
      );
      console.log(`Administrador creado correctamente: ${email}`);
    }

    console.log('Ya puedes iniciar sesión con esas credenciales.');
    process.exit(0);
  } catch (error) {
    console.error('No se pudo crear el administrador:', error.message);
    process.exit(1);
  }
}

crearAdmin();
