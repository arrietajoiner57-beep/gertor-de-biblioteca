const pool = require('../config/db');

const CAMPOS_SELECCION = `
  s.id, s.titulo, s.autor, s.categoria, s.motivo, s.estado, s.fecha_creacion,
  s.usuario_id, u.nombre AS nombre_usuario, u.rol AS rol_usuario,
  (SELECT COUNT(*) FROM sugerencia_voto sv WHERE sv.sugerencia_id = s.id) AS votos
`;

const Sugerencia = {
  getAll: async (usuarioId = null) => {
    const [rows] = await pool.query(
      `SELECT ${CAMPOS_SELECCION},
        EXISTS(SELECT 1 FROM sugerencia_voto sv WHERE sv.sugerencia_id = s.id AND sv.usuario_id = ?) AS yo_voto
       FROM sugerencia s
       INNER JOIN usuario u ON u.id = s.usuario_id
       ORDER BY votos DESC, s.fecha_creacion DESC`,
      [usuarioId]
    );
    return rows;
  },

  getById: async (id) => {
    const [rows] = await pool.query(
      `SELECT ${CAMPOS_SELECCION} FROM sugerencia s
       INNER JOIN usuario u ON u.id = s.usuario_id
       WHERE s.id = ?`,
      [id]
    );
    return rows[0];
  },

  getDuplicada: async (usuarioId, titulo, autor) => {
    const [rows] = await pool.query(
      `SELECT id FROM sugerencia
       WHERE usuario_id = ? AND LOWER(TRIM(titulo)) = LOWER(TRIM(?)) AND LOWER(TRIM(autor)) = LOWER(TRIM(?))
       LIMIT 1`,
      [usuarioId, titulo, autor]
    );
    return rows[0] || null;
  },

  create: async (data) => {
    const [result] = await pool.query('INSERT INTO sugerencia SET ?', [data]);
    return { id: result.insertId, ...data };
  },

  update: async (id, data) => {
    await pool.query('UPDATE sugerencia SET ? WHERE id = ?', [data, id]);
    return { id, ...data };
  },

  delete: async (id) => {
    await pool.query('DELETE FROM sugerencia WHERE id = ?', [id]);
    return { id };
  },

  toggleVoto: async (sugerenciaId, usuarioId) => {
    const [actual] = await pool.query(
      'SELECT id FROM sugerencia_voto WHERE sugerencia_id = ? AND usuario_id = ? LIMIT 1',
      [sugerenciaId, usuarioId]
    );

    if (actual.length > 0) {
      await pool.query('DELETE FROM sugerencia_voto WHERE id = ?', [actual[0].id]);
      return { activo: false };
    }

    await pool.query('INSERT INTO sugerencia_voto SET ?', {
      sugerencia_id: sugerenciaId,
      usuario_id: usuarioId
    });
    return { activo: true };
  },

  contarVotos: async (sugerenciaId) => {
    const [rows] = await pool.query(
      'SELECT COUNT(*) AS total FROM sugerencia_voto WHERE sugerencia_id = ?',
      [sugerenciaId]
    );
    return rows[0].total;
  }
};

module.exports = Sugerencia;