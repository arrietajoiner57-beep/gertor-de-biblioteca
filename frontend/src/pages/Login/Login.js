import React, { useState } from 'react';
import { Link, useNavigate, useSearchParams, useLocation } from 'react-router-dom';
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
  const destino = (location.state && location.state.desde && location.state.desde.pathname) || '/app';

  if (autenticado) {
    navigate(destino || '/app', { replace: true });
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
      navigate(destino || '/app', { replace: true });
    } catch (err) {
      setError(mensajeError(err, 'No se pudo iniciar sesion. Intenta nuevamente.'));
    } finally {
      setCargando(false);
    }
  };

  return (
    <div className={styles.fondo}>
      <div className={styles.tarjeta}>
        <div className={styles.logo}>
          <span className={styles.logoIcono}>
            <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="var(--color-accent)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"/>
              <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"/>
            </svg>
          </span>
          <h1>Biblioteca</h1>
          <p>Inicia sesion para continuar</p>
        </div>

        {expirada && (
          <div className={`${styles.alerta} ${styles.alertaInfo}`}>
            Tu sesion ha expirado. Inicia sesion nuevamente.
          </div>
        )}

        {error && (
          <div className={`${styles.alerta} ${styles.alertaError}`} role="alert">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className={styles.campo}>
            <label htmlFor="email">Correo electronico</label>
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
            <label htmlFor="contrasena">Contrasena</label>
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
            {cargando ? 'Ingresando...' : 'Iniciar sesion'}
          </button>
        </form>

        <div className={styles.footer}>
          <p>
            ¿No tienes cuenta?{' '}
            <Link to="/registro" className={styles.link}>Registrate aqui</Link>
          </p>
          <Link to="/" className={styles.volverLink}>Volver al inicio</Link>
        </div>
      </div>
    </div>
  );
};

export default Login;
