const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const Usuario = require('../models/Usuario');

const SECRET = process.env.JWT_SECRET || 'secreto-desarrollo-cambiar';
const EXPIRA = process.env.TOKEN_EXPIRA_EN || '8h';

const EMAIL_VALIDO = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function generarToken(usuario) {
  return jwt.sign(
    { id: usuario.id, email: usuario.email, rol: usuario.rol },
    SECRET,
    { expiresIn: EXPIRA }
  );
}

const authController = {
  login: async (req, res) => {
    try {
      const { email, contrasena } = req.body;

      if (!email || !contrasena) {
        return res.status(400).json({ message: 'El correo y la contraseña son obligatorios' });
      }

      const usuario = await Usuario.findByEmail(email.trim().toLowerCase());

      if (!usuario) {
        return res.status(401).json({ message: 'Las credenciales son incorrectas' });
      }

      const coincide = await bcrypt.compare(contrasena, usuario.contrasena);

      if (!coincide) {
        return res.status(401).json({ message: 'Las credenciales son incorrectas' });
      }

      const token = generarToken(usuario);

      res.json({
        token,
        usuario: {
          id: usuario.id,
          nombre: usuario.nombre,
          email: usuario.email,
          telefono: usuario.telefono,
          direccion: usuario.direccion,
          rol: usuario.rol
        }
      });
    } catch (error) {
      res.status(500).json({ message: 'No se pudo iniciar sesión. Intenta nuevamente.' });
    }
  },

  register: async (req, res) => {
    try {
      const { nombre, email, contrasena, telefono, direccion } = req.body;

      if (!nombre || !email || !contrasena) {
        return res.status(400).json({ message: 'Nombre, correo y contraseña son obligatorios' });
      }

      if (!EMAIL_VALIDO.test(email)) {
        return res.status(400).json({ message: 'El correo electrónico no es válido' });
      }

      if (contrasena.length < 6) {
        return res.status(400).json({ message: 'La contraseña debe tener al menos 6 caracteres' });
      }

      const existe = await Usuario.findByEmail(email.trim().toLowerCase());
      if (existe) {
        return res.status(400).json({ message: 'Ya existe un usuario registrado con ese correo' });
      }

      const hash = await bcrypt.hash(contrasena, 10);

      const nuevo = await Usuario.create({
        nombre: nombre.trim(),
        email: email.trim().toLowerCase(),
        telefono: telefono || null,
        direccion: direccion || null,
        contrasena: hash,
        rol: 'user'
      });

      const token = generarToken(nuevo);

      res.status(201).json({
        token,
        usuario: {
          id: nuevo.id,
          nombre: nuevo.nombre,
          email: nuevo.email,
          telefono: nuevo.telefono,
          direccion: nuevo.direccion,
          rol: nuevo.rol
        }
      });
    } catch (error) {
      if (error.code === 'ER_DUP_ENTRY') {
        return res.status(400).json({ message: 'Ya existe un usuario registrado con ese correo' });
      }
      res.status(500).json({ message: 'No se pudo registrar el usuario. Intenta nuevamente.' });
    }
  },

  me: async (req, res) => {
    try {
      const usuario = await Usuario.getById(req.usuario.id);
      if (!usuario) {
        return res.status(404).json({ message: 'Usuario no encontrado', code: 'TOKEN_INVALIDO' });
      }
      res.json({ usuario });
    } catch (error) {
      res.status(500).json({ message: 'No se pudo obtener el perfil' });
    }
  },

  cambiarContrasena: async (req, res) => {
    try {
      const { contrasena_actual, contrasena_nueva } = req.body;

      if (!contrasena_actual || !contrasena_nueva) {
        return res.status(400).json({ message: 'Debes completar ambos campos de contraseña' });
      }

      if (contrasena_nueva.length < 6) {
        return res.status(400).json({ message: 'La nueva contraseña debe tener al menos 6 caracteres' });
      }

      const hashActual = await Usuario.getPassword(req.usuario.id);
      const coincide = await bcrypt.compare(contrasena_actual, hashActual);

      if (!coincide) {
        return res.status(400).json({ message: 'La contraseña actual es incorrecta' });
      }

      const hashNuevo = await bcrypt.hash(contrasena_nueva, 10);
      await Usuario.update(req.usuario.id, { contrasena: hashNuevo });

      res.json({ message: 'Contraseña actualizada correctamente' });
    } catch (error) {
      res.status(500).json({ message: 'No se pudo actualizar la contraseña' });
    }
  }
};

module.exports = authController;
