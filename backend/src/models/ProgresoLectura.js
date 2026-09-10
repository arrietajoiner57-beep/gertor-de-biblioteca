const pool = require('../config/db');

const ProgresoLectura = {
  getByUsuarioYLibro: async (usuarioId, libroId) => {
    const [rows] = await pool.query(
      'SELECT * FROM progreso_lectura WHERE usuario_id = ? AND libro_id = ? LIMIT 1',
      [usuarioId, libroId]
    );
    return rows[0];
  },

  upsert: async (usuarioId, libroId, datos) => {
    const [result] = await pool.query(
      `INSERT INTO progreso_lectura (usuario_id, libro_id, ultima_pagina, porcentaje_avance)
       VALUES (?, ?, ?, ?)
       ON DUPLICATE KEY UPDATE
         ultima_pagina = VALUES(ultima_pagina),
         porcentaje_avance = VALUES(porcentaje_avance),
         ultimo_leido_at = CURRENT_TIMESTAMP`,
      [usuarioId, libroId, datos.ultima_pagina, datos.porcentaje_avance]
    );
    return ProgresoLectura.getByUsuarioYLibro(usuarioId, libroId);
  },

  getProgresoUsuario: async (usuarioId) => {
    const [rows] = await pool.query(
      `SELECT p.ultima_pagina, p.porcentaje_avance, p.ultimo_leido_at,
              l.id AS libro_id, l.titulo, l.autor, l.portada, l.paginas
       FROM progreso_lectura p
       INNER JOIN libros l ON l.id = p.libro_id
       WHERE p.usuario_id = ?
       ORDER BY p.ultimo_leido_at DESC`,
      [usuarioId]
    );
    return rows;
  }
};

module.exports = ProgresoLectura;