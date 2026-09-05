const Sugerencia = require('../models/Sugerencia');

const ESTADOS_VALIDOS = ['revision', 'aprobado', 'en_biblioteca'];

const sugerenciaController = {
  getAll: async (req, res) => {
    try {
      const sugerencias = await Sugerencia.getAll(req.usuario.id);
      res.json(sugerencias);
    } catch (error) {
      res.status(500).json({ message: 'No se pudieron obtener las sugerencias' });
    }
  },

  crear: async (req, res) => {
    try {
      const { titulo, autor, categoria, motivo } = req.body;

      const tituloLimpio = typeof titulo === 'string' ? titulo.trim() : '';
      const autorLimpio = typeof autor === 'string' ? autor.trim() : '';

      if (!tituloLimpio) {
        return res.status(400).json({ message: 'Indica el título del libro que solicitas' });
      }
      if (tituloLimpio.length > 200) {
        return res.status(400).json({ message: 'El título es demasiado largo (máximo 200 caracteres)' });
      }
      if (!autorLimpio) {
        return res.status(400).json({ message: 'Indica el autor del libro' });
      }
      if (autorLimpio.length > 150) {
        return res.status(400).json({ message: 'El autor es demasiado largo (máximo 150 caracteres)' });
      }

      const motivoLimpio = typeof motivo === 'string' ? motivo.trim() : '';
      if (motivoLimpio.length > 1000) {
        return res.status(400).json({ message: 'La motivación es demasiado larga (máximo 1000 caracteres)' });
      }

      const duplicada = await Sugerencia.getDuplicada(req.usuario.id, tituloLimpio, autorLimpio);
      if (duplicada) {
        return res.status(400).json({
          message: 'Ya enviaste una sugerencia muy similar. La biblioteca la está revisando.'
        });
      }

      const creada = await Sugerencia.create({
        usuario_id: req.usuario.id,
        titulo: tituloLimpio,
        autor: autorLimpio,
        categoria: categoria && categoria.trim() ? categoria.trim().slice(0, 100) : null,
        motivo: motivoLimpio || null,
        estado: 'revision'
      });

      const sugerencia = await Sugerencia.getById(creada.id);

      res.status(201).json({
        message: '¡Gracias por tu sugerencia! La biblioteca la revisará pronto.',
        sugerencia
      });
    } catch (error) {
      res.status(500).json({ message: 'No se pudo enviar la sugerencia' });
    }
  },

  votar: async (req, res) => {
    try {
      const sugerencia = await Sugerencia.getById(req.params.id);
      if (!sugerencia) {
        return res.status(404).json({ message: 'La sugerencia no existe' });
      }

      if (Number(sugerencia.usuario_id) === req.usuario.id) {
        return res.status(400).json({ message: 'No puedes votar por tu propia sugerencia' });
      }

      const resultado = await Sugerencia.toggleVoto(Number(req.params.id), req.usuario.id);
      const votos = await Sugerencia.contarVotos(Number(req.params.id));

      res.json({
        activo: resultado.activo,
        votos,
        yo_voto: resultado.activo ? 1 : 0
      });
    } catch (error) {
      res.status(500).json({ message: 'No se pudo registrar tu voto' });
    }
  },

  cambiarEstado: async (req, res) => {
    try {
      const { estado } = req.body;

      if (!ESTADOS_VALIDOS.includes(estado)) {
        return res.status(400).json({ message: 'El estado de la solicitud no es válido' });
      }

      const existe = await Sugerencia.getById(req.params.id);
      if (!existe) {
        return res.status(404).json({ message: 'La sugerencia no existe' });
      }

      await Sugerencia.update(req.params.id, { estado });
      const actualizada = await Sugerencia.getById(req.params.id);

      res.json({ message: 'Estado de la solicitud actualizado', sugerencia: actualizada });
    } catch (error) {
      res.status(500).json({ message: 'No se pudo actualizar el estado' });
    }
  },

  eliminar: async (req, res) => {
    try {
      const sugerencia = await Sugerencia.getById(req.params.id);
      if (!sugerencia) {
        return res.status(404).json({ message: 'La sugerencia no existe' });
      }

      const esAutor = Number(sugerencia.usuario_id) === req.usuario.id;
      const esStaff = req.usuario.rol === 'admin' || req.usuario.rol === 'bibliotecario';
      if (!esAutor && !esStaff) {
        return res.status(403).json({ message: 'No tienes permisos para eliminar esta sugerencia' });
      }

      await Sugerencia.delete(req.params.id);
      res.json({ message: 'La sugerencia fue eliminada' });
    } catch (error) {
      res.status(500).json({ message: 'No se pudo eliminar la sugerencia' });
    }
  }
};

module.exports = sugerenciaController;