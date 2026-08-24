import React, { useState } from 'react';
import Badge from '../../components/Badge/Badge';
import { useAuth } from '../../context/AuthContext';
import { cambiarContrasena, mensajeError } from '../../services/api';
import styles from './Perfil.module.css';

const Perfil = () => {
  const { usuario, esAdmin } = useAuth();
  const [passwords, setPasswords] = useState({ contrasena_actual: '', contrasena_nueva: '', confirmar: '' });
  const [mensaje, setMensaje] = useState(null);
  const [guardando, setGuardando] = useState(false);

  if (!usuario) return null;

  const handleChange = (e) => {
    setPasswords({ ...passwords, [e.target.name]: e.target.value });
    setMensaje(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMensaje(null);

    if (passwords.contrasena_nueva !== passwords.confirmar) {
      setMensaje({ tipo: 'error', texto: 'Las contraseñas nuevas no coinciden' });
      return;
    }

    setGuardando(true);

    try {
      const response = await cambiarContrasena({
        contrasena_actual: passwords.contrasena_actual,
        contrasena_nueva: passwords.contrasena_nueva
      });
      setMensaje({ tipo: 'ok', texto: response.data.message });
      setPasswords({ contrasena_actual: '', contrasena_nueva: '', confirmar: '' });
    } catch (err) {
      setMensaje({ tipo: 'error', texto: mensajeError(err) });
    } finally {
      setGuardando(false);
    }
  };

  return (
    <div className={styles.container}>
      <h1 className={styles.title}>Mi Perfil</h1>
      <p className={styles.subtitle}>Información de tu cuenta</p>

      <div className={styles.tarjeta}>
        <div className={styles.cabecera}>
          <span className={styles.avatar}>{usuario.nombre.charAt(0).toUpperCase()}</span>
          <div>
            <h2>{usuario.nombre}</h2>
            <Badge tipo={usuario.rol} />
          </div>
        </div>

        <div className={styles.datos}>
          <p><strong>Correo:</strong> {usuario.email}</p>
          <p><strong>Teléfono:</strong> {usuario.telefono || '-'}</p>
          <p><strong>Dirección:</strong> {usuario.direccion || '-'}</p>
          <p><strong>Fecha de registro:</strong> {usuario.fecha_registro}</p>
        </div>

        {esAdmin && (
          <p className={styles.notaAdmin}>
            Como administrador puedes editar estos datos desde la sección Usuarios.
          </p>
        )}
      </div>

      <div className={styles.tarjeta}>
        <h2 className={styles.subtitulo}>Cambiar contraseña</h2>

        {mensaje && (
          <div className={`${styles.alerta} ${mensaje.tipo === 'ok' ? styles.ok : styles.error}`} role="alert">
            {mensaje.texto}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className={styles.formGroup}>
            <label>Contraseña actual *</label>
            <input
              type="password"
              name="contrasena_actual"
              value={passwords.contrasena_actual}
              onChange={handleChange}
              required
              autoComplete="current-password"
            />
          </div>
          <div className={styles.formGroup}>
            <label>Nueva contraseña *</label>
            <input
              type="password"
              name="contrasena_nueva"
              value={passwords.contrasena_nueva}
              onChange={handleChange}
              minLength="6"
              placeholder="Mínimo 6 caracteres"
              required
              autoComplete="new-password"
            />
          </div>
          <div className={styles.formGroup}>
            <label>Confirmar nueva contraseña *</label>
            <input
              type="password"
              name="confirmar"
              value={passwords.confirmar}
              onChange={handleChange}
              required
              autoComplete="new-password"
            />
          </div>
          <button type="submit" className={styles.btnGuardar} disabled={guardando}>
            {guardando ? 'Guardando...' : 'Actualizar contraseña'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default Perfil;
