const pool = require('../config/db');

const DetallePrestamo = {
  getByPrestamoId: async (prestamoId) => {
    const [rows] = await pool.query(`
      SELECT dp.*, l.titulo AS titulo_libro, l.autor 
      FROM detalle_prestamo dp 
      INNER JOIN libros l ON dp.libro_id = l.id 
      WHERE dp.prestamo_id = ?
    `, [prestamoId]);
    return rows;
  },

  create: async (data) => {
    const [result] = await pool.query('INSERT INTO detalle_prestamo SET ?', [data]);
    return { id: result.insertId, ...data };
  },

  delete: async (id) => {
    await pool.query('DELETE FROM detalle_prestamo WHERE id = ?', [id]);
    return { id };
  }
};

module.exports = DetallePrestamo;
