const fs = require('fs');
const path = require('path');
const pool = require('../config/db');
const ProgresoLectura = require('../models/ProgresoLectura');

const UPLOADS_DIR = path.join(__dirname, '../../uploads');

const CHARS_POR_PAGINA = 1650;

function dividirEnPaginas(texto) {
  const parrafos = texto.split(/\n\s*\n/).map((p) => p.replace(/\s*\n\s*/g, ' ').trim()).filter(Boolean);
  const paginas = [];
  let actual = '';
  for (const parrafo of parrafos) {
    if ((actual + '\n\n' + parrafo).length > CHARS_POR_PAGINA && actual) {
      paginas.push(actual);
      actual = parrafo;
    } else {
      actual = actual ? `${actual}\n\n${parrafo}` : parrafo;
    }
  }
  if (actual) paginas.push(actual);
  return paginas;
}

function esArchivoSeguro(nombre) {
  return nombre && !nombre.includes('..') && !path.isAbsolute(nombre);
}

async function tieneAcceso(libroId, usuarioId) {
  const [suscripcion] = await pool.query(
    `SELECT id FROM suscripciones
     WHERE usuario_id = ?
       AND status IN ('activa', 'prueba')
       AND (fecha_fin IS NULL OR fecha_fin >= CURDATE())
     LIMIT 1`,
    [usuarioId]
  );
  if (suscripcion.length > 0) return 'suscripcion';

  const [prestamo] = await pool.query(
    `SELECT p.id
     FROM prestamo p
     INNER JOIN detalle_prestamo dp ON dp.prestamo_id = p.id
     WHERE p.usuario_id = ?
       AND p.estado = 'activo'
       AND p.fecha_devolucion >= CURDATE()
       AND dp.libro_id = ?
     LIMIT 1`,
    [usuarioId, libroId]
  );
  return prestamo.length > 0 ? 'prestamo' : null;
}

async function registrarTiempoLectura(usuarioId, libroId, minutos) {
  if (minutos <= 0) return;
  const hoy = new Date().toISOString().split('T')[0];
  await pool.query(
    `INSERT INTO lectura_sesion (usuario_id, libro_id, minutos, fecha)
     VALUES (?, ?, ?, ?)
     ON DUPLICATE KEY UPDATE minutos = minutos + VALUES(minutos)`,
    [usuarioId, libroId, minutos, hoy]
  );
}

const lecturaController = {
  streamLibro: async (req, res) => {
    const libroId = req.params.id;
    const usuarioId = req.usuario.id;

    try {
      const [libros] = await pool.query(
        'SELECT id, titulo, archivo_url, es_digital, formato FROM libros WHERE id = ?',
        [libroId]
      );
      const libro = libros[0];

      if (!libro) {
        return res.status(404).json({ message: 'Libro no encontrado' });
      }
      if (!libro.es_digital || !libro.archivo_url) {
        return res.status(404).json({ message: 'Este libro no tiene versión digital disponible' });
      }

      const permitido = await tieneAcceso(libro.id, usuarioId);
      if (!permitido) {
        return res.status(403).json({
          message: 'No tienes un préstamo activo o suscripción para este libro'
        });
      }

      if (!esArchivoSeguro(libro.archivo_url)) {
        return res.status(400).json({ message: 'Ruta de archivo inválida' });
      }

      const ruta = path.join(UPLOADS_DIR, libro.archivo_url);
      if (!fs.existsSync(ruta)) {
        return res.status(404).json({ message: 'El archivo del libro no existe en el servidor' });
      }

      const stat = fs.statSync(ruta);
      const rango = req.headers.range;
      const ext = (libro.formato || path.extname(libro.archivo_url) || '.pdf').toLowerCase().replace('.', '');
      const contentType = ext === 'epub'
        ? 'application/epub+zip'
        : 'application/pdf';

      res.setHeader('Content-Type', contentType);
      res.setHeader('Accept-Ranges', 'bytes');
      res.setHeader('X-Content-Type-Options', 'nosniff');
      res.setHeader('X-Frame-Options', 'SAMEORIGIN');
      res.setHeader('Content-Disposition', `inline; filename="${encodeURIComponent(libro.titulo)}.${ext}"`);
      res.setHeader('X-Lector-Autorizado', req.usuario.email);

      if (rango) {
        const partes = rango.replace(/bytes=/, '').split('-');
        const inicio = parseInt(partes[0], 10);
        const fin = partes[1] ? parseInt(partes[1], 10) : stat.size - 1;
        const tamanoChunk = fin - inicio + 1;

        if (inicio >= stat.size || fin >= stat.size || inicio > fin) {
          res.status(416).setHeader('Content-Range', `bytes */${stat.size}`);
          return res.end();
        }

        res.status(206);
        res.setHeader('Content-Range', `bytes ${inicio}-${fin}/${stat.size}`);
        res.setHeader('Content-Length', tamanoChunk);

        const flujo = fs.createReadStream(ruta, { start: inicio, end: fin });
        flujo.on('error', (err) => {
          if (!res.headersSent) res.status(500).end();
          else res.end();
        });
        flujo.pipe(res);
      } else {
        res.setHeader('Content-Length', stat.size);
        const flujo = fs.createReadStream(ruta);
        flujo.on('error', (err) => {
          if (!res.headersSent) res.status(500).end();
          else res.end();
        });
        flujo.pipe(res);
      }
    } catch (error) {
      if (!res.headersSent) {
        res.status(500).json({ message: 'Error al transmitir el libro' });
      } else {
        res.end();
      }
    }
  },

  getProgreso: async (req, res) => {
    try {
      const { libroId } = req.params;
      const progreso = await ProgresoLectura.getByUsuarioYLibro(req.usuario.id, libroId);
      if (!progreso) {
        return res.json({
          usuario_id: req.usuario.id,
          libro_id: parseInt(libroId, 10),
          ultima_pagina: 1,
          porcentaje_avance: 0,
          ultimo_leido_at: null
        });
      }
      res.json(progreso);
    } catch (error) {
      res.status(500).json({ message: 'No se pudo obtener el progreso de lectura' });
    }
  },

  saveProgreso: async (req, res) => {
    try {
      const { libroId } = req.params;
      const { ultima_pagina, porcentaje_avance, minutos_leidos, total_paginas } = req.body;

      const pagina = Math.max(1, parseInt(ultima_pagina) || 1);
      let porcentaje = parseFloat(porcentaje_avance);
      if (isNaN(porcentaje)) {
        porcentaje = total_paginas ? Math.min(100, Math.round((pagina / total_paginas) * 1000) / 10) : 0;
      }
      porcentaje = Math.max(0, Math.min(100, porcentaje));

      const [libros] = await pool.query('SELECT id FROM libros WHERE id = ?', [libroId]);
      if (libros.length === 0) {
        return res.status(404).json({ message: 'Libro no encontrado' });
      }

      const resultado = await ProgresoLectura.upsert(req.usuario.id, libroId, {
        ultima_pagina: pagina,
        porcentaje_avance: porcentaje
      });

      const minutos = parseInt(minutos_leidos) || 0;
      if (minutos > 0) {
        await registrarTiempoLectura(req.usuario.id, libroId, minutos);
      }

      res.json(resultado);
    } catch (error) {
      res.status(500).json({ message: 'No se pudo guardar el progreso de lectura' });
    }
  },

  getStatsLectura: async (req, res) => {
    try {
      const usuarioId = req.usuario.id;

      const [minutos] = await pool.query(
        'SELECT COALESCE(SUM(minutos), 0) AS total_minutos FROM lectura_sesion WHERE usuario_id = ?',
        [usuarioId]
      );

      const [completados] = await pool.query(
        `SELECT COUNT(*) AS total FROM progreso_lectura
         WHERE usuario_id = ? AND porcentaje_avance >= 100`,
        [usuarioId]
      );

      const [racha] = await pool.query(
        `SELECT COUNT(DISTINCT fecha) AS dias_totales
         FROM lectura_sesion
         WHERE usuario_id = ?`,
        [usuarioId]
      );

      let streak = 0;
      const cursor = new Date();
      cursor.setHours(0, 0, 0, 0);

      for (let i = 0; i < 365; i++) {
        const fechaStr = cursor.toISOString().split('T')[0];
        const [check] = await pool.query(
          'SELECT id FROM lectura_sesion WHERE usuario_id = ? AND fecha = ? LIMIT 1',
          [usuarioId, fechaStr]
        );
        if (check.length === 0) break;
        streak++;
        cursor.setDate(cursor.getDate() - 1);
      }

      res.json({
        totalMinutos: Number(minutos[0].total_minutos),
        librosCompletados: completados[0].total,
        rachaActual: streak,
        librosEnProgreso: (await ProgresoLectura.getProgresoUsuario(usuarioId))
      });
    } catch (error) {
      res.status(500).json({ message: 'No se pudieron obtener las estadísticas de lectura' });
    }
  },

  submitTiempoLectura: async (req, res) => {
    try {
      const { libro_id, minutos } = req.body;
      if (!libro_id || !minutos) {
        return res.status(400).json({ message: 'Se requieren libro_id y minutos' });
      }
      await registrarTiempoLectura(req.usuario.id, libro_id, parseInt(minutos) || 0);
      res.json({ message: 'Tiempo de lectura registrado' });
    } catch (error) {
      res.status(500).json({ message: 'No se pudo registrar el tiempo de lectura' });
    }
  },

  checkAcceso: async (req, res) => {
    try {
      const { id } = req.params;
      const [libros] = await pool.query(
        'SELECT id, titulo, es_digital, archivo_url FROM libros WHERE id = ?',
        [id]
      );
      const libro = libros[0];
      if (!libro) {
        return res.status(404).json({ message: 'Libro no encontrado' });
      }
      const accesible = libro.es_digital && libro.archivo_url;
      res.json({
        libro_id: libro.id,
        existe: true,
        es_digital: Boolean(libro.es_digital && libro.archivo_url),
        permitido: Boolean(accesible && (await tieneAcceso(libro.id, req.usuario.id)))
      });
    } catch (error) {
      res.status(500).json({ message: 'No se pudo verificar el acceso' });
    }
  },

  getTexto: async (req, res) => {
    try {
      const { id } = req.params;
      const pagina = Math.max(1, parseInt(req.query.pagina, 10) || 1);

      const [libros] = await pool.query(
        'SELECT id, titulo, archivo_url, es_digital FROM libros WHERE id = ?',
        [id]
      );
      const libro = libros[0];
      if (!libro) {
        return res.status(404).json({ message: 'Libro no encontrado' });
      }
      if (!libro.es_digital || !libro.archivo_url) {
        return res.status(404).json({ message: 'Este libro no tiene versión digital disponible' });
      }

      const permitido = await tieneAcceso(libro.id, req.usuario.id);
      if (!permitido) {
        return res.status(403).json({
          message: 'No tienes un préstamo activo o suscripción para este libro'
        });
      }

      if (!esArchivoSeguro(libro.archivo_url)) {
        return res.status(400).json({ message: 'Ruta de archivo inválida' });
      }

      const textoRuta = path.join(
        UPLOADS_DIR,
        'textos',
        `${path.basename(libro.archivo_url, path.extname(libro.archivo_url))}.txt`
      );
      if (!fs.existsSync(textoRuta)) {
        return res.status(404).json({ message: 'Este libro aún no tiene texto para traducir' });
      }

      const paginasTexto = dividirEnPaginas(fs.readFileSync(textoRuta, 'utf8'));
      if (pagina > paginasTexto.length) {
        return res.status(400).json({ message: 'Página fuera de rango', total_paginas: paginasTexto.length });
      }

      res.json({
        libro_id: libro.id,
        titulo: libro.titulo,
        total_paginas: paginasTexto.length,
        pagina,
        texto: paginasTexto[pagina - 1]
      });
    } catch (error) {
      res.status(500).json({ message: 'No se pudo obtener el texto de la página' });
    }
  },

  getMisLibros: async (req, res) => {
    try {
      const usuarioId = req.usuario.id;

      const [susActiva] = await pool.query(
        `SELECT id FROM suscripciones
         WHERE usuario_id = ?
           AND status IN ('activa', 'prueba')
           AND (fecha_fin IS NULL OR fecha_fin >= CURDATE())
         LIMIT 1`,
        [usuarioId]
      );
      const tieneSuscripcion = susActiva.length > 0;

      const [filas] = await pool.query(
        `SELECT
           l.id AS libro_id, l.titulo, l.autor, l.portada, l.paginas,
           l.archivo_url, l.formato,
           p.id AS prestamo_id, p.estado AS prestamo_estado,
           p.fecha_prestamo, p.fecha_devolucion,
           pl.ultima_pagina, pl.porcentaje_avance, pl.ultimo_leido_at
         FROM detalle_prestamo dp
         INNER JOIN prestamo p ON p.id = dp.prestamo_id
         INNER JOIN libros l ON l.id = dp.libro_id
         LEFT JOIN progreso_lectura pl ON pl.libro_id = l.id AND pl.usuario_id = ?
         WHERE p.usuario_id = ?
         ORDER BY
           (p.estado = 'activo') DESC,
           p.fecha_prestamo DESC`,
        [usuarioId, usuarioId]
      );

      const hoy = new Date().toISOString().split('T')[0];

      const agrupados = new Map();
      for (const f of filas) {
        if (!agrupados.has(f.libro_id)) {
          agrupados.set(f.libro_id, {
            libro: {
              id: f.libro_id,
              titulo: f.titulo,
              autor: f.autor,
              portada: f.portada,
              paginas: f.paginas,
              archivo_url: f.archivo_url,
              formato: f.formato
            },
            prestamos: [],
            progreso: {
              ultima_pagina: f.ultima_pagina || 1,
              porcentaje_avance: Number(f.porcentaje_avance) || 0,
              ultimo_leido_at: f.ultimo_leido_at
            }
          });
        }
        agrupados.get(f.libro_id).prestamos.push({
          id: f.prestamo_id,
          estado: f.prestamo_estado,
          fecha_prestamo: f.fecha_prestamo,
          fecha_devolucion: f.fecha_devolucion
        });
      }

      const libros = [...agrupados.values()].map((item) => {
        const activo = item.prestamos.find(
          (pr) => pr.estado === 'activo' && pr.fecha_devolucion >= hoy
        );
        const porSuscripcion = tieneSuscripcion && item.libro.archivo_url;
        return {
          ...item,
          accesible: Boolean(activo) || porSuscripcion,
          via: activo ? 'prestamo' : (porSuscripcion ? 'suscripcion' : null)
        };
      });

      res.json({ lectura: libros, via_suscripcion: tieneSuscripcion });
    } catch (error) {
      res.status(500).json({ message: 'No se pudieron obtener tus libros en préstamo' });
    }
  }
};

module.exports = lecturaController;