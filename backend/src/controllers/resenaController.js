const Resena = require('../models/Resena');
const Libro = require('../models/Libro');

const PUBLICOS_VALIDOS = ['todo', 'ninos', 'jovenes', 'adultos_mayores'];

function puedeModerar(req) {
  return req.usuario.rol === 'admin' || req.usuario.rol === 'bibliotecario';
}

const resenaController = {
  getAllRecientes: async (req, res) => {
    try {
      const resenas = await Resena.getRecientes(req.query.limite, req.usuario.id);
      res.json(resenas);
    } catch (error) {
      res.status(500).json({ message: 'No se pudieron obtener las reseñas' });
    }
  },

  getByLibro: async (req, res) => {
    try {
      const libro = await Libro.getById(req.params.libroId);
      if (!libro) {
        return res.status(404).json({ message: 'El libro no existe' });
      }

      const resenas = await Resena.getByLibro(req.params.libroId, req.usuario.id);
      const resumen = await Resena.resumenLibro(req.params.libroId);

      res.json({
        libro: {
          id: libro.id,
          titulo: libro.titulo,
          autor: libro.autor,
          portada: libro.portada
        },
        resumen,
        resenas
      });
    } catch (error) {
      res.status(500).json({ message: 'No se pudieron obtener las reseñas' });
    }
  },

  crear: async (req, res) => {
    try {
      const { libro_id, calificacion, comentario, publico_recomendado } = req.body;

      if (!libro_id) {
        return res.status(400).json({ message: 'Debes indicar el libro' });
      }

      const libro = await Libro.getById(libro_id);
      if (!libro) {
        return res.status(404).json({ message: 'El libro no existe' });
      }

      const estrellas = parseInt(calificacion, 10);
      if (!estrellas || estrellas < 1 || estrellas > 5) {
        return res.status(400).json({ message: 'Elige una calificación de 1 a 5 estrellas' });
      }

      const texto = typeof comentario === 'string' ? comentario.trim() : '';
      if (!texto) {
        return res.status(400).json({ message: 'Escribe tu opinión antes de publicar' });
      }
      if (texto.length > 1500) {
        return res.status(400).json({ message: 'Tu opinión es demasiado larga (máximo 1500 caracteres)' });
      }

      const publico = PUBLICOS_VALIDOS.includes(publico_recomendado)
        ? publico_recomendado
        : 'todo';

      const existente = await Resena.getPorUsuarioYLibro(libro_id, req.usuario.id);

      let resena;
      if (existente) {
        await Resena.update(existente.id, {
          calificacion: estrellas,
          comentario: texto,
          publico_recomendado: publico
        });
        resena = await Resena.getById(existente.id);
      } else {
        const creada = await Resena.create({
          libro_id,
          usuario_id: req.usuario.id,
          calificacion: estrellas,
          comentario: texto,
          publico_recomendado: publico
        });
        resena = await Resena.getById(creada.id);
      }

      res.status(201).json({
        message: '¡Gracias por compartir tu opinión!',
        resena
      });
    } catch (error) {
      res.status(500).json({ message: 'No se pudo publicar la opinión' });
    }
  },

  toggleLike: async (req, res) => {
    try {
      const resena = await Resena.getById(req.params.id);
      if (!resena) {
        return res.status(404).json({ message: 'La reseña no existe' });
      }

      if (Number(resena.usuario_id) === req.usuario.id) {
        return res.status(400).json({ message: 'No puedes marcar como útil tu propia opinión' });
      }

      const resultado = await Resena.toggleLike(Number(req.params.id), req.usuario.id);
      const likes = await Resena.contarLikes(Number(req.params.id));

      res.json({
        activo: resultado.activo,
        likes,
        yo_like: resultado.activo ? 1 : 0
      });
    } catch (error) {
      res.status(500).json({ message: 'No se pudo actualizar la reseña' });
    }
  },

  eliminar: async (req, res) => {
    try {
      const resena = await Resena.getById(req.params.id);
      if (!resena) {
        return res.status(404).json({ message: 'La reseña no existe' });
      }

      const esDuena = Number(resena.usuario_id) === req.usuario.id;
      if (!esDuena && !puedeModerar(req)) {
        return res.status(403).json({ message: 'No tienes permisos para eliminar esta opinión' });
      }

      await Resena.delete(req.params.id);
      res.json({ message: 'La opinión fue eliminada correctamente' });
    } catch (error) {
      res.status(500).json({ message: 'No se pudo eliminar la opinión' });
    }
  }
};

module.exports = resenaController;