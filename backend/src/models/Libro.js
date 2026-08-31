const pool = require('../config/db');
const { construirBusqueda } = require('../utils/libroQuery');

const Libro = {
  getAll: async ({ q } = {}) => {
    const { clausula, params } = construirBusqueda(q);
    const [rows] = await pool.query(
      `SELECT * FROM libros ${clausula} ORDER BY id DESC`,
      params
    );
    return rows;
  },

  getById: async (id) => {
    const [rows] = await pool.query('SELECT * FROM libros WHERE id = ?', [id]);
    return rows[0];
  },

  create: async (data) => {
    const [result] = await pool.query('INSERT INTO libros SET ?', [data]);
    return { id: result.insertId, ...data };
  },

  update: async (id, data) => {
    await pool.query('UPDATE libros SET ? WHERE id = ?', [data, id]);
    return { id, ...data };
  },

  delete: async (id) => {
    await pool.query('DELETE FROM libros WHERE id = ?', [id]);
    return { id };
  }
};

module.exports = Libro;
