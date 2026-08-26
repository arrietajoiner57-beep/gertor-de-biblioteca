const jwt = require('jsonwebtoken');

const SECRET = process.env.JWT_SECRET || 'secreto-desarrollo-cambiar';

function verifyToken(req, res, next) {
  const header = req.headers.authorization;

  if (!header || !header.startsWith('Bearer ')) {
    return res.status(401).json({ message: 'No has iniciado sesión', code: 'NO_TOKEN' });
  }

  const token = header.split(' ')[1];

  try {
    const decoded = jwt.verify(token, SECRET);
    req.usuario = {
      id: decoded.id,
      email: decoded.email,
      rol: decoded.rol
    };
    next();
  } catch (error) {
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({ message: 'Tu sesión ha expirado. Inicia sesión nuevamente.', code: 'TOKEN_EXPIRADO' });
    }
    return res.status(401).json({ message: 'Sesión inválida. Inicia sesión nuevamente.', code: 'TOKEN_INVALIDO' });
  }
}

function requireAdmin(req, res, next) {
  if (req.usuario.rol !== 'admin') {
    return res.status(403).json({ message: 'No tienes permisos para realizar esta acción.', code: 'SIN_PERMISOS' });
  }
  next();
}

function requireBibliotecario(req, res, next) {
  const rolesPermitidos = ['admin', 'bibliotecario'];
  if (!rolesPermitidos.includes(req.usuario.rol)) {
    return res.status(403).json({ message: 'No tienes permisos para realizar esta acción.', code: 'SIN_PERMISOS' });
  }
  next();
}

module.exports = { verifyToken, requireAdmin, requireBibliotecario };
