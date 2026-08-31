const jwt = require('jsonwebtoken');
const { Server } = require('socket.io');

const SECRET = process.env.JWT_SECRET || 'secreto-desarrollo-cambiar';

let io = null;

/**
 * Inicializa Socket.IO sobre el servidor HTTP existente.
 * Autentica cada socket con el token JWT enviado en el handshake
 * y lo asigna a sus salas (staff o usuario-{id}).
 */
function iniciarSocket(httpServer) {
  io = new Server(httpServer, {
    cors: {
      origin: '*',
      methods: ['GET', 'POST']
    }
  });

  io.use((socket, next) => {
    const token = socket.handshake.auth && socket.handshake.auth.token;
    if (!token) {
      return next(new Error('No autenticado'));
    }
    try {
      const decoded = jwt.verify(token, SECRET);
      socket.usuario = { id: decoded.id, email: decoded.email, rol: decoded.rol };
      next();
    } catch (error) {
      next(new Error('Token inválido'));
    }
  });

  io.on('connection', (socket) => {
    const { id, rol } = socket.usuario;

    // Sala privada para notificar a este usuario
    socket.join(`usuario-${id}`);

    // Sala de personal (admin + bibliotecario)
    if (rol === 'admin' || rol === 'bibliotecario') {
      socket.join('staff');
    }

    socket.on('disconnect', () => {
      socket.leave(`usuario-${id}`);
      socket.leave('staff');
    });
  });

  return io;
}

/** Notifica al personal (admin/bibliotecario) de una nueva solicitud de préstamo. */
function notificarSolicitud({ prestamoId, usuarioNombre, libroTitulo }) {
  if (!io) return;
  io.to('staff').emit('nueva-solicitud', {
    prestamoId,
    usuarioNombre,
    libroTitulo,
    mensaje: `Nueva solicitud de préstamo de ${usuarioNombre}`
  });
}

/** Notifica a un usuario concreto sobre el estado de su préstamo. */
function notificarUsuario({ usuarioId, mensaje, tipo, prestamoId }) {
  if (!io) return;
  io.to(`usuario-${usuarioId}`).emit('notificacion', {
    prestamoId,
    tipo,
    mensaje
  });
}

module.exports = { iniciarSocket, notificarSolicitud, notificarUsuario };
