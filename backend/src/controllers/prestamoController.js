const Prestamo = require('../models/Prestamo');
const DetallePrestamo = require('../models/DetallePrestamo');
const Libro = require('../models/Libro');

function esFechaValida(valor) {
  return /^\d{4}-\d{2}-\d{2}$/.test(valor) && !isNaN(Date.parse(valor));
}

const prestamoController = {
  getAll: async (req, res) => {
    try {
      const prestamos = await Prestamo.getAll({ estado: req.query.estado });
      res.json(prestamos);
    } catch (error) {
      res.status(500).json({ message: 'No se pudieron obtener los préstamos' });
    }
  },

  getMisPrestamos: async (req, res) => {
    try {
      const prestamos = await Prestamo.getByUsuarioId(req.usuario.id, { estado: req.query.estado });

      const conDetalles = await Promise.all(
        prestamos.map(async (p) => ({
          ...p,
          detalles: await DetallePrestamo.getByPrestamoId(p.id)
        }))
      );

      res.json(conDetalles);
    } catch (error) {
      res.status(500).json({ message: 'No se pudieron obtener tus préstamos' });
    }
  },

  getById: async (req, res) => {
    try {
      const prestamo = await Prestamo.getById(req.params.id);
      if (!prestamo) {
        return res.status(404).json({ message: 'Préstamo no encontrado' });
      }

      let detalles;
      if (req.usuario.rol === 'admin' || req.usuario.id === prestamo.usuario_id) {
        detalles = await DetallePrestamo.getByPrestamoId(req.params.id);
      } else {
        return res.status(403).json({ message: 'No tienes permisos para ver este préstamo' });
      }

      res.json({ ...prestamo, detalles });
    } catch (error) {
      res.status(500).json({ message: 'No se pudo obtener el préstamo' });
    }
  },

  create: async (req, res) => {
    try {
      const { usuario_id, fecha_prestamo, fecha_devolucion, libros } = req.body;

      if (!usuario_id || !fecha_prestamo || !fecha_devolucion) {
        return res.status(400).json({ message: 'El usuario y las fechas son obligatorios' });
      }

      if (!esFechaValida(fecha_prestamo) || !esFechaValida(fecha_devolucion)) {
        return res.status(400).json({ message: 'Las fechas no son válidas' });
      }

      if (fecha_devolucion < fecha_prestamo) {
        return res.status(400).json({ message: 'La fecha de devolución debe ser posterior a la del préstamo' });
      }

      if (!Array.isArray(libros) || libros.length === 0) {
        return res.status(400).json({ message: 'Debe seleccionar al menos un libro' });
      }

      for (const item of libros) {
        const cantidad = parseInt(item.cantidad) || 1;

        if (cantidad < 1) {
          return res.status(400).json({ message: 'La cantidad a prestar debe ser al menos 1' });
        }

        const encontrado = await Libro.getById(item.libro_id);
        if (!encontrado) {
          return res.status(404).json({ message: `El libro seleccionado no existe` });
        }
        if (cantidad > encontrado.cantidad_disponible) {
          return res.status(400).json({
            message: `El libro "${encontrado.titulo}" no está disponible (disponibles: ${encontrado.cantidad_disponible})`
          });
        }
      }

      const prestamo = await Prestamo.create({
        usuario_id,
        fecha_prestamo,
        fecha_devolucion,
        estado: 'activo'
      });

      for (const item of libros) {
        const cantidad = parseInt(item.cantidad) || 1;

        await DetallePrestamo.create({
          prestamo_id: prestamo.id,
          libro_id: item.libro_id,
          cantidad
        });

        await Libro.update(item.libro_id, {
          cantidad_disponible: await getNuevaCantidad(item.libro_id, cantidad)
        });
      }

      res.status(201).json(prestamo);
    } catch (error) {
      res.status(500).json({ message: 'No se pudo crear el préstamo' });
    }
  },

  update: async (req, res) => {
    try {
      const actual = await Prestamo.getById(req.params.id);
      if (!actual) {
        return res.status(404).json({ message: 'Préstamo no encontrado' });
      }

      if (actual.estado === 'devuelto') {
        return res.status(400).json({ message: 'No se puede editar un préstamo ya devuelto' });
      }

      const datos = {};
      const { usuario_id, fecha_prestamo, fecha_devolucion } = req.body;

      if (usuario_id !== undefined) datos.usuario_id = usuario_id;
      if (fecha_prestamo !== undefined) {
        if (!esFechaValida(fecha_prestamo)) {
          return res.status(400).json({ message: 'La fecha de préstamo no es válida' });
        }
        datos.fecha_prestamo = fecha_prestamo;
      }
      if (fecha_devolucion !== undefined) {
        if (!esFechaValida(fecha_devolucion)) {
          return res.status(400).json({ message: 'La fecha de devolución no es válida' });
        }
        datos.fecha_devolucion = fecha_devolucion;
      }

      const fPrestamo = datos.fecha_prestamo || actual.fecha_prestamo;
      const fDevolucion = datos.fecha_devolucion || actual.fecha_devolucion;

      if (fDevolucion < fPrestamo) {
        return res.status(400).json({ message: 'La fecha de devolución debe ser posterior a la del préstamo' });
      }

      await Prestamo.update(req.params.id, datos);
      res.json(await Prestamo.getById(req.params.id));
    } catch (error) {
      res.status(500).json({ message: 'No se pudo actualizar el préstamo' });
    }
  },

  devolver: async (req, res) => {
    try {
      const estadoReal = await Prestamo.getEstadoReal(req.params.id);

      if (!estadoReal) {
        return res.status(404).json({ message: 'Préstamo no encontrado' });
      }

      if (estadoReal === 'devuelto') {
        return res.status(400).json({ message: 'Este préstamo ya fue devuelto' });
      }

      const detalles = await DetallePrestamo.getByPrestamoId(req.params.id);

      for (const detalle of detalles) {
        const libro = await Libro.getById(detalle.libro_id);
        await Libro.update(detalle.libro_id, {
          cantidad_disponible: libro.cantidad_disponible + detalle.cantidad
        });
      }

      await Prestamo.update(req.params.id, { estado: 'devuelto' });

      res.json({ message: 'Libros devueltos correctamente' });
    } catch (error) {
      res.status(500).json({ message: 'No se pudo registrar la devolución' });
    }
  },

  solicitar: async (req, res) => {
    try {
      const { libro_id, cantidad } = req.body;

      if (!libro_id) {
        return res.status(400).json({ message: 'Debe seleccionar un libro' });
      }

      const cant = parseInt(cantidad) || 1;
      if (cant < 1) {
        return res.status(400).json({ message: 'La cantidad debe ser al menos 1' });
      }

      const libro = await Libro.getById(libro_id);
      if (!libro) {
        return res.status(404).json({ message: 'El libro seleccionado no existe' });
      }

      if (cant > libro.cantidad_disponible) {
        return res.status(400).json({
          message: `El libro "${libro.titulo}" no tiene suficiente stock (disponibles: ${libro.cantidad_disponible})`
        });
      }

      const hoy = new Date();
      const fechaPrestamo = hoy.toISOString().split('T')[0];
      const fechaDevolucion = new Date(hoy.getTime() + 14 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];

      const prestamo = await Prestamo.create({
        usuario_id: req.usuario.id,
        fecha_prestamo: fechaPrestamo,
        fecha_devolucion: fechaDevolucion,
        estado: 'pendiente'
      });

      await DetallePrestamo.create({
        prestamo_id: prestamo.id,
        libro_id,
        cantidad: cant
      });

      res.status(201).json({
        message: 'Solicitud de préstamo enviada. Esperando aprobación del administrador.',
        prestamo
      });
    } catch (error) {
      res.status(500).json({ message: 'No se pudo crear la solicitud de préstamo' });
    }
  },

  aprobar: async (req, res) => {
    try {
      const estadoReal = await Prestamo.getEstadoReal(req.params.id);

      if (!estadoReal) {
        return res.status(404).json({ message: 'Préstamo no encontrado' });
      }

      if (estadoReal !== 'pendiente') {
        return res.status(400).json({ message: 'Solo se pueden aprobar préstamos pendientes' });
      }

      const detalles = await DetallePrestamo.getByPrestamoId(req.params.id);

      for (const detalle of detalles) {
        const libro = await Libro.getById(detalle.libro_id);
        if (libro.cantidad_disponible < detalle.cantidad) {
          return res.status(400).json({
            message: `El libro "${libro.titulo}" ya no tiene stock suficiente (disponibles: ${libro.cantidad_disponible})`
          });
        }
      }

      for (const detalle of detalles) {
        const libro = await Libro.getById(detalle.libro_id);
        await Libro.update(detalle.libro_id, {
          cantidad_disponible: libro.cantidad_disponible - detalle.cantidad
        });
      }

      await Prestamo.update(req.params.id, { estado: 'activo' });

      res.json({ message: 'Préstamo aprobado correctamente' });
    } catch (error) {
      res.status(500).json({ message: 'No se pudo aprobar el préstamo' });
    }
  },

  rechazar: async (req, res) => {
    try {
      const estadoReal = await Prestamo.getEstadoReal(req.params.id);

      if (!estadoReal) {
        return res.status(404).json({ message: 'Préstamo no encontrado' });
      }

      if (estadoReal !== 'pendiente') {
        return res.status(400).json({ message: 'Solo se pueden rechazar préstamos pendientes' });
      }

      await Prestamo.delete(req.params.id);

      res.json({ message: 'Solicitud de préstamo rechazada' });
    } catch (error) {
      res.status(500).json({ message: 'No se pudo rechazar el préstamo' });
    }
  },

  delete: async (req, res) => {
    try {
      const estadoReal = await Prestamo.getEstadoReal(req.params.id);

      if (!estadoReal) {
        return res.status(404).json({ message: 'Préstamo no encontrado' });
      }

      if (estadoReal === 'activo') {
        return res.status(400).json({
          message: 'No puedes eliminar un préstamo activo. Registra la devolución primero.'
        });
      }

      await Prestamo.delete(req.params.id);
      res.json({ message: 'El préstamo fue eliminado correctamente' });
    } catch (error) {
      res.status(500).json({ message: 'No se pudo eliminar el préstamo' });
    }
  }
};

async function getNuevaCantidad(libroId, cantidadPrestada) {
  const libro = await Libro.getById(libroId);
  const nueva = libro.cantidad_disponible - cantidadPrestada;
  return nueva < 0 ? 0 : nueva;
}

module.exports = prestamoController;
