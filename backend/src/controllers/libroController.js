const Libro = require('../models/Libro');

function sanitizeLibro(data) {
  const clean = { ...data };
  if (clean.anio_publicacion === '' || clean.anio_publicacion === undefined) {
    clean.anio_publicacion = null;
  }
  if (clean.cantidad_disponible !== undefined) {
    clean.cantidad_disponible = parseInt(clean.cantidad_disponible) || 0;
  }
  if (clean.es_digital !== undefined) {
    clean.es_digital = clean.es_digital === 1 || clean.es_digital === true || clean.es_digital === '1' ? 1 : 0;
  }
  if (clean.formato && !['pdf', 'epub'].includes(clean.formato)) {
    clean.formato = 'pdf';
  }
  if (clean.paginas !== undefined) {
    clean.paginas = parseInt(clean.paginas) || null;
  }
  if ((clean.archivo_url === '' || clean.archivo_url === undefined)) {
    clean.archivo_url = null;
  }
  if (clean.es_digital === 0) {
    clean.archivo_url = null;
    clean.formato = null;
  }
  return clean;
}

const libroController = {
  getAll: async (req, res) => {
    try {
      const libros = await Libro.getAll({ q: req.query.q });
      res.json(libros);
    } catch (error) {
      res.status(500).json({ message: 'Error al obtener libros', error: error.message });
    }
  },

  getById: async (req, res) => {
    try {
      const libro = await Libro.getById(req.params.id);
      if (!libro) {
        return res.status(404).json({ message: 'Libro no encontrado' });
      }
      res.json(libro);
    } catch (error) {
      res.status(500).json({ message: 'Error al obtener libro', error: error.message });
    }
  },

  create: async (req, res) => {
    try {
      if (!req.body.titulo || !req.body.autor || !req.body.isbn) {
        return res.status(400).json({ message: 'Título, autor e ISBN son obligatorios' });
      }
      const nuevo = await Libro.create(sanitizeLibro(req.body));
      res.status(201).json(nuevo);
    } catch (error) {
      if (error.code === 'ER_DUP_ENTRY') {
        return res.status(400).json({ message: 'Ya existe un libro con ese ISBN' });
      }
      res.status(500).json({ message: 'Error al crear libro', error: error.message });
    }
  },

  update: async (req, res) => {
    try {
      const actualizado = await Libro.update(req.params.id, sanitizeLibro(req.body));
      res.json(actualizado);
    } catch (error) {
      if (error.code === 'ER_DUP_ENTRY') {
        return res.status(400).json({ message: 'Ya existe un libro con ese ISBN' });
      }
      res.status(500).json({ message: 'Error al actualizar libro', error: error.message });
    }
  },

  delete: async (req, res) => {
    try {
      await Libro.delete(req.params.id);
      res.json({ message: 'Libro eliminado' });
    } catch (error) {
      res.status(500).json({ message: 'Error al eliminar libro', error: error.message });
    }
  },

  subirArchivo: async (req, res) => {
    try {
      if (!req.file) {
        return res.status(400).json({ message: 'No se recibió ningún archivo' });
      }

      const fs = require('fs');
      const extension = require('path').extname(req.file.originalname).toLowerCase();
      const formato = extension === '.epub' ? 'epub' : 'pdf';

      let paginas = null;
      if (formato === 'pdf') {
        try {
          const buffer = fs.readFileSync(req.file.path);
          const texto = buffer.toString('latin1');
          const coincidencias = texto.match(/\/Type\s*\/Page\b/g) || [];
          const excluidas = texto.match(/\/Type\s*\/Pages\b/g) || [];
          const conteo = coincidencias.length - excluidas.length;
          if (conteo > 0) paginas = conteo;
        } catch (e) {
          paginas = null;
        }
      }

      res.json({
        archivo_url: req.file.filename,
        nombre_original: req.file.originalname,
        formato,
        paginas
      });
    } catch (error) {
      res.status(500).json({ message: 'Error al subir el archivo', error: error.message });
    }
  }
};

module.exports = libroController;
