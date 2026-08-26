import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { mensajeError } from '../../services/api';
import styles from './Registro.module.css';

const Registro = () => {
  const [formData, setFormData] = useState({
    nombre: '',
    email: '',
    contrasena: '',
    confirmar: '',
    telefono: '',
    direccion: ''
  });
  const [error, setError] = useState('');
  const [cargando, setCargando] = useState(false);
  const { registrar, autenticado } = useAuth();
  const navigate = useNavigate();

  if (autenticado) {
    navigate('/app', { replace: true });
  }

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (formData.contrasena !== formData.confirmar) {
      setError('Las contraseñas no coinciden');
      return;
    }

    if (formData.contrasena.length < 6) {
      setError('La contraseña debe tener al menos 6 caracteres');
      return;
    }

    setCargando(true);

    try {
      await registrar({
        nombre: formData.nombre,
        email: formData.email,
        contrasena: formData.contrasena,
        telefono: formData.telefono || undefined,
        direccion: formData.direccion || undefined
      });
      navigate('/app', { replace: true });
    } catch (err) {
      setError(mensajeError(err, 'No se pudo completar el registro. Intenta nuevamente.'));
    } finally {
      setCargando(false);
    }
  };

  return (
    <div className={styles.fondo}>
      <div className={styles.tarjeta}>
        <div className={styles.logo}>
          <span className={styles.logoIcono}>
            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="var(--color-accent)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"/>
              <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"/>
            </svg>
          </span>
          <h1>Crear Cuenta</h1>
          <p>Registrate para acceder al catalogo de la biblioteca</p>
        </div>

        {error && (
          <div className={`${styles.alerta} ${styles.alertaError}`} role="alert">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className={styles.campo}>
            <label htmlFor="nombre">Nombre completo *</label>
            <input
              id="nombre"
              type="text"
              name="nombre"
              value={formData.nombre}
              onChange={handleChange}
              placeholder="Tu nombre completo"
              required
            />
          </div>

          <div className={styles.campo}>
            <label htmlFor="email">Correo electronico *</label>
            <input
              id="email"
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              placeholder="tu@correo.com"
              autoComplete="username"
              required
            />
          </div>

          <div className={styles.campoRow}>
            <div className={styles.campo}>
              <label htmlFor="contrasena">Contraseña *</label>
              <input
                id="contrasena"
                type="password"
                name="contrasena"
                value={formData.contrasena}
                onChange={handleChange}
                placeholder="Minimo 6 caracteres"
                autoComplete="new-password"
                required
                minLength="6"
              />
            </div>
            <div className={styles.campo}>
              <label htmlFor="confirmar">Confirmar contraseña *</label>
              <input
                id="confirmar"
                type="password"
                name="confirmar"
                value={formData.confirmar}
                onChange={handleChange}
                placeholder="Repite tu contraseña"
                autoComplete="new-password"
                required
                minLength="6"
              />
            </div>
          </div>

          <div className={styles.campoRow}>
            <div className={styles.campo}>
              <label htmlFor="telefono">Telefono (opcional)</label>
              <input
                id="telefono"
                type="text"
                name="telefono"
                value={formData.telefono}
                onChange={handleChange}
                placeholder="Tu numero de telefono"
              />
            </div>
            <div className={styles.campo}>
              <label htmlFor="direccion">Direccion (opcional)</label>
              <input
                id="direccion"
                type="text"
                name="direccion"
                value={formData.direccion}
                onChange={handleChange}
                placeholder="Tu direccion"
              />
            </div>
          </div>

          <button type="submit" className={styles.botonRegistrar} disabled={cargando}>
            {cargando ? 'Creando cuenta...' : 'Crear Cuenta'}
          </button>
        </form>

        <div className={styles.footer}>
          <p>
            ¿Ya tienes cuenta?{' '}
            <Link to="/login" className={styles.link}>Inicia sesion aqui</Link>
          </p>
          <Link to="/" className={styles.volverLink}>Volver al inicio</Link>
        </div>
      </div>
    </div>
  );
};

export default Registro;
