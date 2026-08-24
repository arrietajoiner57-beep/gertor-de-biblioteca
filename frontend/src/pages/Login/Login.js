import React, { useState } from 'react';
import { useNavigate, useSearchParams, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { mensajeError } from '../../services/api';
import styles from './Login.module.css';

const Login = () => {
  const [formData, setFormData] = useState({ email: '', contrasena: '' });
  const [error, setError] = useState('');
  const [cargando, setCargando] = useState(false);
  const { iniciarSesion, autenticado } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [searchParams] = useSearchParams();

  const expirada = searchParams.get('expirada') === '1';
  const destino = (location.state && location.state.desde && location.state.desde.pathname) || null;

  if (autenticado) {
    navigate(destino || '/', { replace: true });
  }

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setCargando(true);
    setError('');

    try {
      await iniciarSesion(formData.email, formData.contrasena);
      navigate(destino || '/', { replace: true });
    } catch (err) {
      setError(mensajeError(err, 'No se pudo iniciar sesión. Intenta nuevamente.'));
    } finally {
      setCargando(false);
    }
  };

  return (
    <div className={styles.fondo}>
      <div className={styles.tarjeta}>
        <div className={styles.logo}>
          <span className={styles.logoIcono}>📚</span>
          <h1>Biblioteca</h1>
          <p>Sistema de gestión de biblioteca</p>
        </div>

        {expirada && (
          <div className={`${styles.alerta} ${styles.alertaInfo}`}>
            Tu sesión ha expirado. Inicia sesión nuevamente.
          </div>
        )}

        {error && (
          <div className={`${styles.alerta} ${styles.alertaError}`} role="alert">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className={styles.campo}>
            <label htmlFor="email">Correo electrónico</label>
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

          <div className={styles.campo}>
            <label htmlFor="contrasena">Contraseña</label>
            <input
              id="contrasena"
              type="password"
              name="contrasena"
              value={formData.contrasena}
              onChange={handleChange}
              placeholder="••••••••"
              autoComplete="current-password"
              required
            />
          </div>

          <button type="submit" className={styles.botonEntrar} disabled={cargando}>
            {cargando ? 'Ingresando...' : 'Iniciar sesión'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default Login;
