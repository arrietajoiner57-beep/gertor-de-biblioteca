const pool = require('../config/db');

const CAMPOS_SELECCION = `
  r.id, r.libro_id, r.usuario_id,
  u.nombre AS nombre_usuario, u.rol AS rol_usuario,
  r.calificacion, r.comentario, r.publico_recomendado, r.fecha_creacion,
  (SELECT COUNT(*) FROM resena_like rl WHERE rl.resena_id = r.id) AS likes
`;

const Resena = {
  getByLibro: async (libroId, usuarioId = null) => {
    const [rows] = await pool.query(
      `SELECT ${CAMPOS_SELECCION},
        EXISTS(SELECT 1 FROM resena_like rl WHERE rl.resena_id = r.id AND rl.usuario_id = ?) AS yo_like
       FROM resena r
       INNER JOIN usuario u ON u.id = r.usuario_id
       WHERE r.libro_id = ?
       ORDER BY r.fecha_creacion DESC, r.id DESC`,
      [usuarioId, libroId]
    );
    return rows;
  },

  getRecientes: async (limite = 30, usuarioId = null) => {
    const [rows] = await pool.query(
      `SELECT ${CAMPOS_SELECCION},
        l.titulo AS libro_titulo, l.autor AS libro_autor, l.portada AS libro_portada,
        EXISTS(SELECT 1 FROM resena_like rl WHERE rl.resena_id = r.id AND rl.usuario_id = ?) AS yo_like
       FROM resena r
       INNER JOIN usuario u ON u.id = r.usuario_id
       INNER JOIN libros l ON l.id = r.libro_id
       ORDER BY r.fecha_creacion DESC, r.id DESC
       LIMIT ?`,
      [usuarioId, parseInt(limite) || 30]
    );
    return rows;
  },

  getById: async (id) => {
    const [rows] = await pool.query(
      `SELECT ${CAMPOS_SELECCION} FROM resena r
       INNER JOIN usuario u ON u.id = r.usuario_id
       WHERE r.id = ?`,
      [id]
    );
    return rows[0];
  },

  getPorUsuarioYLibro: async (libroId, usuarioId) => {
    const [rows] = await pool.query(
      'SELECT * FROM resena WHERE libro_id = ? AND usuario_id = ? LIMIT 1',
      [libroId, usuarioId]
    );
    return rows[0];
  },

  resumenLibro: async (libroId) => {
    const [rows] = await pool.query(
      `SELECT COUNT(*) AS total, COALESCE(AVG(calificacion), 0) AS promedio
       FROM resena WHERE libro_id = ?`,
      [libroId]
    );
    const fila = rows[0];
    return {
      total: fila.total,
      promedio: Math.round(Number(fila.promedio) * 10) / 10
    };
  },

  create: async (data) => {
    const [result] = await pool.query('INSERT INTO resena SET ?', [data]);
    return { id: result.insertId, ...data };
  },

  update: async (id, data) => {
    await pool.query('UPDATE resena SET ? WHERE id = ?', [data, id]);
    return { id, ...data };
  },

  delete: async (id) => {
    await pool.query('DELETE FROM resena WHERE id = ?', [id]);
    return { id };
  },

  toggleLike: async (resenaId, usuarioId) => {
    const [actual] = await pool.query(
      'SELECT id FROM resena_like WHERE resena_id = ? AND usuario_id = ? LIMIT 1',
      [resenaId, usuarioId]
    );

    if (actual.length > 0) {
      await pool.query('DELETE FROM resena_like WHERE id = ?', [actual[0].id]);
      return { activo: false };
    }

    await pool.query('INSERT INTO resena_like SET ?', {
      resena_id: resenaId,
      usuario_id: usuarioId
    });
    return { activo: true };
  },

  contarLikes: async (resenaId) => {
    const [rows] = await pool.query(
      'SELECT COUNT(*) AS total FROM resena_like WHERE resena_id = ?',
      [resenaId]
    );
    return rows[0].total;
  }
};

module.exports = Resena;