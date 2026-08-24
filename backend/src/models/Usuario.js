const pool = require('../config/db');

const CAMPOS_PUBLICOS = 'id, nombre, email, telefono, direccion, rol, fecha_registro';

const Usuario = {
  getAll: async () => {
    const [rows] = await pool.query(`SELECT ${CAMPOS_PUBLICOS} FROM usuario ORDER BY id DESC`);
    return rows;
  },

  getById: async (id) => {
    const [rows] = await pool.query(`SELECT ${CAMPOS_PUBLICOS} FROM usuario WHERE id = ?`, [id]);
    return rows[0];
  },

  findByEmail: async (email) => {
    const [rows] = await pool.query('SELECT * FROM usuario WHERE email = ?', [email]);
    return rows[0];
  },

  getPassword: async (id) => {
    const [rows] = await pool.query('SELECT contrasena FROM usuario WHERE id = ?', [id]);
    return rows[0] ? rows[0].contrasena : null;
  },

  create: async (data) => {
    const [result] = await pool.query('INSERT INTO usuario SET ?', [data]);
    return { id: result.insertId, ...data };
  },

  update: async (id, data) => {
    await pool.query('UPDATE usuario SET ? WHERE id = ?', [data, id]);
    return { id, ...data };
  },

  delete: async (id) => {
    await pool.query('DELETE FROM usuario WHERE id = ?', [id]);
    return { id };
  }
};

module.exports = Usuario;
