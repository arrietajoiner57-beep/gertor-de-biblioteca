import React, { useState } from 'react';
import { Link, useNavigate, useSearchParams, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useToasts } from '../../context/ToastContext';
import { mensajeError } from '../../services/api';
import styles from './Login.module.css';

const Login = () => {
  const [formData, setFormData] = useState({ email: '', contrasena: '' });
  const [mostrarPass, setMostrarPass] = useState(false);
  const [error, setError] = useState('');
  const [cargando, setCargando] = useState(false);
  const { iniciarSesion, autenticado } = useAuth();
  const toasts = useToasts();
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
      setError(mensajeError(err, 'No se pudo iniciar sesión. Intenta nuevamente.'));
    } finally {
      setCargando(false);
    }
  };

  const accesoRapido = (proveedor) => {
    toasts.info(`El acceso con ${proveedor} estará disponible pronto. Usa tu correo por ahora.`, 4000);
  };

  return (
    <div className={styles.fondo}>
      {/* Showcase izquierdo */}
      <section className={styles.showcase}>
        <div className={styles.showcaseGlow} />
        <div className={styles.particula} style={{ top: '12%', left: '12%', animationDelay: '0s' }} />
        <div className={styles.particula} style={{ top: '26%', left: '68%', animationDelay: '1.2s' }} />
        <div className={styles.particula} style={{ top: '64%', left: '22%', animationDelay: '2.1s' }} />
        <div className={styles.particula} style={{ top: '80%', left: '58%', animationDelay: '.6s' }} />

        <div className={styles.librosFlotantes}>
          <div className={`${styles.libro} ${styles.libro1}`}>
            <span className={styles.libroEspina}>El Principio</span>
            <span className={styles.libroTitulo}>C S</span>
          </div>
          <div className={`${styles.libro} ${styles.libro2}`}>
            <span className={styles.libroEspina}>Fundación</span>
            <span className={styles.libroTitulo}>A I</span>
          </div>
          <div className={`${styles.libro} ${styles.libro3}`}>
            <span className={styles.libroEspina}>Dune</span>
            <span className={styles.libroTitulo}>F H</span>
          </div>
          <div className={`${styles.libro} ${styles.libro4}`}>
            <span className={styles.libroEspina}>El Aleph</span>
            <span className={styles.libroTitulo}>J L B</span>
          </div>
          <div className={`${styles.libro} ${styles.libro5}`}>
            <span className={styles.libroEspina}>1984</span>
            <span className={styles.libroTitulo}>G O</span>
          </div>
        </div>

        <div className={styles.showcaseTexto}>
          <span className={styles.showcaseBadge}>Sistema Bibliotecario Inmersivo</span>
          <h1 className={styles.showcaseTitle}>
            Tu portal al
            <span className={styles.showcaseResaltado}> conocimiento infinito</span>
          </h1>
          <p className={styles.showcaseSub}>
            Explora un catálogo curado, solicita préstamos y vive la lectura como nunca antes.
          </p>
        </div>
      </section>

      {/* Panel de acceso */}
      <section className={styles.panel}>
        <div className={styles.tarjeta}>
          <div className={styles.logo}>
            <span className={styles.logoIcono}>
              <svg width="34" height="34" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"/>
                <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"/>
              </svg>
            </span>
            <h2>Biblioteca</h2>
          </div>

          <div className={styles.switcher}>
            <span className={`${styles.switchPill} ${styles.switchActivo}`}>Iniciar Sesión</span>
            <Link to="/registro" className={styles.switchPill} data-text="Registrarse">
              <span style={{ position: 'relative', zIndex: 1 }}>Registrarse</span>
            </Link>
          </div>

          {expirada && (
            <div className={`${styles.alerta} ${styles.alertaInfo}`} role="alert">
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
              <div className={styles.inputWrap}>
                <span className={styles.inputIcono}>
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <rect x="2" y="4" width="20" height="16" rx="2"/><path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"/>
                  </svg>
                </span>
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
            </div>

            <div className={styles.campo}>
              <label htmlFor="contrasena">Contraseña</label>
              <div className={styles.inputWrap}>
                <span className={styles.inputIcono}>
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/>
                  </svg>
                </span>
                <input
                  id="contrasena"
                  type={mostrarPass ? 'text' : 'password'}
                  name="contrasena"
                  value={formData.contrasena}
                  onChange={handleChange}
                  placeholder="••••••••"
                  autoComplete="current-password"
                  required
                />
                <button
                  type="button"
                  className={styles.ojo}
                  onClick={() => setMostrarPass((m) => !m)}
                  aria-label="Mostrar u ocultar contraseña"
                >
                  {mostrarPass ? (
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"/><line x1="1" y1="1" x2="23" y2="23"/></svg>
                  ) : (
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>
                  )}
                </button>
              </div>
            </div>

            <button type="submit" className={`${styles.botonEntrar} ${cargando ? styles.cargando : ''}`} disabled={cargando}>
              <span>{cargando ? 'Ingresando...' : 'Entrar a la Biblioteca'}</span>
              {!cargando && (
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M5 12h14M12 5l7 7-7 7"/>
                </svg>
              )}
            </button>
          </form>

          <div className={styles.divisor}>
            <span>o continúa con</span>
          </div>

          <div className={styles.accionesRapidas}>
            <button type="button" className={styles.btnSocial} onClick={() => accesoRapido('Google')}>
              <svg width="18" height="18" viewBox="0 0 24 24">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.27-4.74 3.27-8.1z"/>
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                <path fill="#FBBC05" d="M5.84 14.1A7 7 0 0 1 5.5 12c0-.73.12-1.44.34-2.1V7.06H2.18A11 11 0 0 0 1 12c0 1.78.43 3.45 1.18 4.94l3.66-2.84z"/>
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84C6.71 7.31 9.14 5.38 12 5.38z"/>
              </svg>
              Google
            </button>
            <button type="button" className={styles.btnSocial} onClick={() => accesoRapido('GitHub')}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 .36a11.36 11.36 0 0 0-3.59 22.14c.57.1.78-.25.78-.55v-2.02c-3.17.69-3.84-1.33-3.84-1.33-.52-1.32-1.27-1.67-1.27-1.67-1.03-.7.08-.69.08-.69 1.14.08 1.75 1.17 1.75 1.17 1.02 1.74 2.67 1.24 3.32.95.1-.74.4-1.24.72-1.53-2.55-.29-5.23-1.27-5.23-5.66 0-1.25.45-2.27 1.18-3.08-.12-.29-.51-1.45.11-3.03 0 0 .96-.31 3.15 1.18a10.92 10.92 0 0 1 5.74 0c2.19-1.49 3.15-1.18 3.15-1.18.62 1.58.23 2.74.11 3.03.73.81 1.18 1.83 1.18 3.08 0 4.4-2.69 5.37-5.25 5.65.41.35.78 1.05.78 2.12v3.15c0 .3.2.66.79.55A11.36 11.36 0 0 0 12 .36z"/>
              </svg>
              GitHub
            </button>
          </div>

          <div className={styles.footer}>
            <p>
              ¿Aún no tienes cuenta?{' '}
              <Link to="/registro" className={styles.link}>Crea una gratis</Link>
            </p>
            <Link to="/" className={styles.volverLink}>Volver al inicio</Link>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Login;