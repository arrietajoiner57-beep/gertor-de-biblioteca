const pool = require('../config/db');

// El estado "vencido" se calcula automáticamente: préstamo activo cuya
// fecha de devolución ya pasó.
const ESTADO_CALCULADO = `
  CASE
    WHEN p.estado = 'activo' AND p.fecha_devolucion < CURDATE() THEN 'vencido'
    ELSE p.estado
  END AS estado
`;

function filtroEstado(estado) {
  switch (estado) {
    case 'activo':
      return "AND p.estado = 'activo' AND p.fecha_devolucion >= CURDATE()";
    case 'vencido':
      return "AND p.estado = 'activo' AND p.fecha_devolucion < CURDATE()";
    case 'devuelto':
      return "AND p.estado = 'devuelto'";
    default:
      return '';
  }
}

const Prestamo = {
  getAll: async ({ estado } = {}) => {
    const [rows] = await pool.query(`
      SELECT p.id, p.usuario_id, p.fecha_prestamo, p.fecha_devolucion,
             ${ESTADO_CALCULADO}, u.nombre AS nombre_usuario
      FROM prestamo p
      INNER JOIN usuario u ON p.usuario_id = u.id
      WHERE 1 = 1 ${filtroEstado(estado)}
      ORDER BY p.id DESC
    `);
    return rows;
  },

  getById: async (id) => {
    const [rows] = await pool.query(`
      SELECT p.id, p.usuario_id, p.fecha_prestamo, p.fecha_devolucion,
             ${ESTADO_CALCULADO}, u.nombre AS nombre_usuario
      FROM prestamo p
      INNER JOIN usuario u ON p.usuario_id = u.id
      WHERE p.id = ?
    `, [id]);
    return rows[0];
  },

  getByUsuarioId: async (usuarioId, { estado } = {}) => {
    const [rows] = await pool.query(`
      SELECT p.id, p.usuario_id, p.fecha_prestamo, p.fecha_devolucion,
             ${ESTADO_CALCULADO}
      FROM prestamo p
      WHERE p.usuario_id = ? ${filtroEstado(estado)}
      ORDER BY p.id DESC
    `, [usuarioId]);
    return rows;
  },

  getEstadoReal: async (id) => {
    const [rows] = await pool.query('SELECT estado FROM prestamo WHERE id = ?', [id]);
    return rows[0] ? rows[0].estado : null;
  },

  create: async (data) => {
    const [result] = await pool.query('INSERT INTO prestamo SET ?', [data]);
    return { id: result.insertId, ...data };
  },

  update: async (id, data) => {
    await pool.query('UPDATE prestamo SET ? WHERE id = ?', [data, id]);
    return { id, ...data };
  },

  delete: async (id) => {
    await pool.query('DELETE FROM prestamo WHERE id = ?', [id]);
    return { id };
  }
};

module.exports = Prestamo;
