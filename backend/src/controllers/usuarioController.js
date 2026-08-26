const bcrypt = require('bcryptjs');
const Usuario = require('../models/Usuario');

const EMAIL_VALIDO = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const ROLES_VALIDOS = ['admin', 'user', 'bibliotecario'];

function sanitizeUsuario(data) {
  const clean = { ...data };
  delete clean.id;
  delete clean.fecha_registro;
  if (clean.telefono === undefined) clean.telefono = null;
  if (clean.direccion === undefined) clean.direccion = null;
  return clean;
}

const usuarioController = {
  getAll: async (req, res) => {
    try {
      const usuarios = await Usuario.getAll();
      res.json(usuarios);
    } catch (error) {
      res.status(500).json({ message: 'No se pudieron obtener los usuarios' });
    }
  },

  getById: async (req, res) => {
    try {
      const usuario = await Usuario.getById(req.params.id);
      if (!usuario) {
        return res.status(404).json({ message: 'Usuario no encontrado' });
      }
      res.json(usuario);
    } catch (error) {
      res.status(500).json({ message: 'No se pudo obtener el usuario' });
    }
  },

  create: async (req, res) => {
    try {
      const { nombre, email, contrasena, rol } = req.body;

      if (!nombre || !email || !contrasena) {
        return res.status(400).json({ message: 'Nombre, correo y contraseña son obligatorios' });
      }

      if (!EMAIL_VALIDO.test(email)) {
        return res.status(400).json({ message: 'El correo electrónico no es válido' });
      }

      if (contrasena.length < 6) {
        return res.status(400).json({ message: 'La contraseña debe tener al menos 6 caracteres' });
      }

      let rolFinal = ROLES_VALIDOS.includes(rol) ? rol : 'user';

      if (rolFinal === 'admin' && req.usuario.rol !== 'admin') {
        rolFinal = 'user';
      }

      const existe = await Usuario.findByEmail(email.trim().toLowerCase());
      if (existe) {
        return res.status(400).json({ message: 'Ya existe un usuario registrado con ese correo' });
      }

      const nuevo = await Usuario.create({
        nombre: nombre.trim(),
        email: email.trim().toLowerCase(),
        telefono: req.body.telefono || null,
        direccion: req.body.direccion || null,
        contrasena: await bcrypt.hash(contrasena, 10),
        rol: rolFinal
      });

      const { contrasena: _, ...usuarioPublico } = nuevo;
      res.status(201).json(usuarioPublico);
    } catch (error) {
      if (error.code === 'ER_DUP_ENTRY') {
        return res.status(400).json({ message: 'Ya existe un usuario registrado con ese correo' });
      }
      res.status(500).json({ message: 'No se pudo crear el usuario' });
    }
  },

  update: async (req, res) => {
    try {
      const { nombre, email, contrasena, rol } = req.body;
      const datos = {};

      if (!req.body.nombre && !email && !contrasena && !rol && req.body.telefono === undefined && req.body.direccion === undefined) {
        return res.status(400).json({ message: 'No hay cambios para guardar' });
      }

      if (nombre !== undefined) datos.nombre = nombre.trim();
      if (req.body.telefono !== undefined) datos.telefono = req.body.telefono || null;
      if (req.body.direccion !== undefined) datos.direccion = req.body.direccion || null;

      if (email !== undefined) {
        if (!EMAIL_VALIDO.test(email)) {
          return res.status(400).json({ message: 'El correo electrónico no es válido' });
        }
        const existe = await Usuario.findByEmail(email.trim().toLowerCase());
        if (existe && existe.id !== Number(req.params.id)) {
          return res.status(400).json({ message: 'Ya existe otro usuario con ese correo' });
        }
        datos.email = email.trim().toLowerCase();
      }

      if (rol !== undefined) {
        if (!ROLES_VALIDOS.includes(rol)) {
          return res.status(400).json({ message: 'El rol especificado no es válido' });
        }

        if (Number(req.params.id) === req.usuario.id && rol !== req.usuario.rol) {
          return res.status(400).json({ message: 'No puedes cambiar tu propio rol' });
        }

        if (rol === 'admin' && req.usuario.rol !== 'admin') {
          return res.status(403).json({ message: 'Solo un administrador puede asignar el rol de administrador' });
        }

        datos.rol = rol;
      }

      if (contrasena) {
        if (contrasena.length < 6) {
          return res.status(400).json({ message: 'La contraseña debe tener al menos 6 caracteres' });
        }
        datos.contrasena = await bcrypt.hash(contrasena, 10);
      }

      await Usuario.update(req.params.id, datos);
      const actualizado = await Usuario.getById(req.params.id);
      res.json(actualizado);
    } catch (error) {
      if (error.code === 'ER_DUP_ENTRY') {
        return res.status(400).json({ message: 'Ya existe otro usuario con ese correo' });
      }
      res.status(500).json({ message: 'No se pudo actualizar el usuario' });
    }
  },

  delete: async (req, res) => {
    try {
      if (Number(req.params.id) === req.usuario.id) {
        return res.status(400).json({ message: 'No puedes eliminar tu propia cuenta mientras la usas' });
      }

      const prestamosActivos = await require('../config/db').query(
        "SELECT COUNT(*) as total FROM prestamo WHERE usuario_id = ? AND estado = 'activo'",
        [req.params.id]
      );

      if (prestamosActivos[0][0].total > 0) {
        return res.status(400).json({
          message: 'Este usuario tiene préstamos activos. Registra las devoluciones antes de eliminarlo.'
        });
      }

      await Usuario.delete(req.params.id);
      res.json({ message: 'El usuario fue eliminado correctamente' });
    } catch (error) {
      res.status(500).json({ message: 'No se pudo eliminar el usuario' });
    }
  }
};

module.exports = usuarioController;
