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
  const [mostrarPass, setMostrarPass] = useState(false);
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
      {/* Showcase izquierdo */}
      <section className={styles.showcase}>
        <div className={styles.showcaseGlow} />
        <div className={styles.particula} style={{ top: '14%', left: '16%', animationDelay: '0s' }} />
        <div className={styles.particula} style={{ top: '30%', left: '70%', animationDelay: '1.1s' }} />
        <div className={styles.particula} style={{ top: '70%', left: '24%', animationDelay: '2s' }} />
        <div className={styles.particula} style={{ top: '82%', left: '60%', animationDelay: '.5s' }} />

        <div className={styles.librosFlotantes}>
          <div className={`${styles.libro} ${styles.libro1}`}>
            <span className={styles.libroEspina}>Cien Años</span>
            <span className={styles.libroTitulo}>G G M</span>
          </div>
          <div className={`${styles.libro} ${styles.libro2}`}>
            <span className={styles.libroEspina}>Sapiens</span>
            <span className={styles.libroTitulo}>Y N H</span>
          </div>
          <div className={`${styles.libro} ${styles.libro3}`}>
            <span className={styles.libroEspina}>El Quijote</span>
            <span className={styles.libroTitulo}>M C</span>
          </div>
          <div className={`${styles.libro} ${styles.libro4}`}>
            <span className={styles.libroEspina}>Bright</span>
            <span className={styles.libroTitulo}>R</span>
          </div>
          <div className={`${styles.libro} ${styles.libro5}`}>
            <span className={styles.libroEspina}>Idiotez</span>
            <span className={styles.libroTitulo}>D K</span>
          </div>
        </div>

        <div className={styles.showcaseTexto}>
          <span className={styles.showcaseBadge}>Únete a la comunidad lectora</span>
          <h1 className={styles.showcaseTitle}>
            Tu próxima gran lectura
            <span className={styles.showcaseResaltado}> te está esperando</span>
          </h1>
          <p className={styles.showcaseSub}>
            Crea tu cuenta y accede a un universo de historias, conocimiento y aventura.
          </p>
        </div>
      </section>

      {/* Panel de registro */}
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
            <Link to="/login" className={styles.switchPill}>Iniciar Sesión</Link>
            <span className={`${styles.switchPill} ${styles.switchActivo}`} style={{ position: 'relative', zIndex: 1 }}>Registrarse</span>
          </div>

          {error && (
            <div className={styles.alerta} role="alert">
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
              <label htmlFor="email">Correo electrónico *</label>
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
                <div className={styles.inputWrap}>
                  <input
                    id="contrasena"
                    type={mostrarPass ? 'text' : 'password'}
                    name="contrasena"
                    value={formData.contrasena}
                    onChange={handleChange}
                    placeholder="Mínimo 6 caracteres"
                    autoComplete="new-password"
                    required
                    minLength="6"
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
              <div className={styles.campo}>
                <label htmlFor="confirmar">Confirmar contraseña *</label>
                <input
                  id="confirmar"
                  type={mostrarPass ? 'text' : 'password'}
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
                <label htmlFor="telefono">Teléfono (opcional)</label>
                <input
                  id="telefono"
                  type="text"
                  name="telefono"
                  value={formData.telefono}
                  onChange={handleChange}
                  placeholder="Tu número de teléfono"
                />
              </div>
              <div className={styles.campo}>
                <label htmlFor="direccion">Dirección (opcional)</label>
                <input
                  id="direccion"
                  type="text"
                  name="direccion"
                  value={formData.direccion}
                  onChange={handleChange}
                  placeholder="Tu dirección"
                />
              </div>
            </div>

            <button type="submit" className={styles.botonRegistrar} disabled={cargando}>
              {cargando ? 'Creando cuenta...' : 'Crear mi cuenta'}
              {!cargando && (
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M5 12h14M12 5l7 7-7 7"/>
                </svg>
              )}
            </button>
          </form>

          <div className={styles.footer}>
            <p>
              ¿Ya tienes cuenta?{' '}
              <Link to="/login" className={styles.link}>Inicia sesión aquí</Link>
            </p>
            <Link to="/" className={styles.volverLink}>Volver al inicio</Link>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Registro;