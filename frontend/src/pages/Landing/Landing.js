import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { getPublicStats, getFeaturedLibros } from '../../services/api';
import BookCover from '../../components/BookCover/BookCover';
import styles from './Landing.module.css';

const Landing = () => {
  const { autenticado } = useAuth();
  const navigate = useNavigate();
  const [stats, setStats] = useState(null);
  const [libros, setLibros] = useState([]);

  useEffect(() => {
    getPublicStats().then((r) => setStats(r.data)).catch(() => {});
    getFeaturedLibros().then((r) => setLibros(r.data)).catch(() => {});
  }, []);

  useEffect(() => {
    if (autenticado) {
      navigate('/app', { replace: true });
    }
  }, [autenticado, navigate]);

  if (autenticado) return null;

  const statsItems = stats
    ? [
        { numero: stats.totalLibros, etiqueta: 'Libros en Catálogo', icono: 'libro' },
        { numero: stats.librosDisponibles, etiqueta: 'Ejemplares Disponibles', icono: 'check' },
        { numero: stats.totalGeneros, etiqueta: 'Géneros', icono: 'compas' },
        { numero: stats.prestamosActivos, etiqueta: 'Préstamos Activos', icono: 'reloj' }
      ]
    : [];

  return (
    <div className={styles.landing}>
      <nav className={styles.nav}>
        <div className={styles.navInner}>
          <div className={styles.logo}>
            <span className={styles.logoIcon}>
              <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"/>
                <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"/>
              </svg>
            </span>
            <span className={styles.logoTexto}>Biblioteca</span>
          </div>
          <div className={styles.navActions}>
            <Link to="/login" className={styles.btnNav}>Iniciar Sesión</Link>
            <Link to="/registro" className={styles.btnNavPrimary}>Registrarse</Link>
          </div>
        </div>
      </nav>

      <section className={styles.hero}>
        <div className={styles.heroAurora} />
        <div className={styles.particula} style={{ top: '20%', left: '14%', animationDelay: '0s' }} />
        <div className={styles.particula} style={{ top: '64%', left: '82%', animationDelay: '1.4s' }} />
        <div className={styles.particula} style={{ top: '30%', left: '88%', animationDelay: '2.4s' }} />
        <div className={styles.particula} style={{ top: '76%', left: '18%', animationDelay: '.8s' }} />

        <div className={styles.heroContent}>
          <span className={styles.heroBadge}>Sistema de Gestión Bibliotecaria</span>
          <h1 className={styles.heroTitle}>
            Tu biblioteca,
            <br />
            <span className={styles.heroHighlight}>siempre a tu alcance</span>
          </h1>
          <p className={styles.heroSubtitle}>
            Administra tu catálogo de libros, gestiona préstamos y lleva un control
            completo de tu biblioteca con una plataforma moderna e inmersiva.
          </p>
          <div className={styles.heroCtas}>
            <Link to="/registro" className={styles.btnHeroPrimary}>
              Comenzar Ahora
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M5 12h14M12 5l7 7-7 7"/>
              </svg>
            </Link>
            <Link to="/login" className={styles.btnHeroSecondary}>
              Ya tengo cuenta
            </Link>
          </div>
        </div>

        <div className={styles.heroVisual}>
          <div className={styles.libro3d} style={{ background: 'linear-gradient(160deg,#8b5cf6,#5b21b6)', '--retraso': '0s' }}>
            <span>Dune</span>
          </div>
          <div className={styles.libro3d} style={{ background: 'linear-gradient(160deg,#f59e0b,#b45309)', '--retraso': '1.1s' }}>
            <span>Fundación</span>
          </div>
          <div className={styles.libro3d} style={{ background: 'linear-gradient(160deg,#0ea5e9,#0369a1)', '--retraso': '2s' }}>
            <span>El Principio</span>
          </div>
          <div className={styles.libro3d} style={{ background: 'linear-gradient(160deg,#10b981,#047857)', '--retraso': '0.6s' }}>
            <span>1984</span>
          </div>
        </div>
      </section>

      {stats && (
        <section className={styles.stats}>
          <div className={styles.statsGrid}>
            {statsItems.map((s) => (
              <div key={s.etiqueta} className={styles.statCard}>
                <div className={styles.statIcono}>
                  {s.icono === 'libro' && (
                    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"/><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"/>
                    </svg>
                  )}
                  {s.icono === 'check' && (
                    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/>
                    </svg>
                  )}
                  {s.icono === 'compas' && (
                    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M21 3 9 15M21 3l-6 12-1.5 1.5M21 3l-4.5 18-3-9-9-3 18-4.5z"/>
                    </svg>
                  )}
                  {s.icono === 'reloj' && (
                    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/>
                    </svg>
                  )}
                </div>
                <div className={styles.statNumero}>{s.numero}</div>
                <div className={styles.statEtiqueta}>{s.etiqueta}</div>
              </div>
            ))}
          </div>
        </section>
      )}

      {libros.length > 0 && (
        <section className={styles.featured}>
          <h2 className={styles.sectionTitle}>Libros Destacados</h2>
          <p className={styles.sectionSubtitle}>Descubre algunas de las joyas de nuestro catálogo</p>
          <div className={styles.booksGrid}>
            {libros.map((libro) => (
              <div key={libro.id} className={styles.bookCard}>
                <div className={styles.bookCoverWrap}>
                  <div className={styles.bookCover3d}>
                    <BookCover portada={libro.portada} titulo={libro.titulo} size="md" />
                  </div>
                  <span className={`${styles.floatingBadge} ${libro.cantidad_disponible > 0 ? styles.badgeAvailable : styles.badgeAgotado}`}>
                    {libro.cantidad_disponible > 0 ? `● ${libro.cantidad_disponible} disponibles` : 'Agotado'}
                  </span>
                </div>
                <div className={styles.bookInfo}>
                  <h3 className={styles.bookTitle}>{libro.titulo}</h3>
                  <p className={styles.bookAuthor}>{libro.autor}</p>
                  {libro.genero && (
                    <span className={styles.bookGenre}>{libro.genero}</span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      <section className={styles.features}>
        <h2 className={styles.sectionTitle}>Por qué usar nuestra plataforma</h2>
        <p className={styles.sectionSubtitle}>Herramientas diseñadas para simplificar la gestión bibliotecaria</p>
        <div className={styles.featuresGrid}>
          <div className={styles.featureCard}>
            <div className={`${styles.featureIcon} ${styles.featureVioleta}`}>
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="11" cy="11" r="8"/><path d="M21 21l-4.35-4.35"/>
              </svg>
            </div>
            <h3>Búsqueda Avanzada</h3>
            <p>Encuentra cualquier libro por título, autor, género o ISBN al instante con la paleta de comandos.</p>
          </div>
          <div className={styles.featureCard}>
            <div className={`${styles.featureIcon} ${styles.featureAzul}`}>
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M12 22c5.523 0 10-4.477 10-10S17.523 2 12 2 2 6.477 2 12s4.477 10 10 10z"/>
                <path d="M12 6v6l4 2"/>
              </svg>
            </div>
            <h3>Gestión de Préstamos</h3>
            <p>Solicita, aprueba y controla préstamos con seguimiento de fechas y estados en tiempo real.</p>
          </div>
          <div className={styles.featureCard}>
            <div className={`${styles.featureIcon} ${styles.featureEsmeralda}`}>
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/>
                <path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/>
              </svg>
            </div>
            <h3>Multi-usuario</h3>
            <p>Roles diferenciados para administradores, bibliotecarios y usuarios con permisos seguros.</p>
          </div>
          <div className={styles.featureCard}>
            <div className={`${styles.featureIcon} ${styles.featureDorado}`}>
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <rect x="3" y="3" width="18" height="18" rx="2" ry="2"/><path d="M3 9h18M9 21V9"/>
              </svg>
            </div>
            <h3>Panel de Control</h3>
            <p>Analítica y gráficos inmersivos para una visión completa de la actividad bibliotecaria.</p>
          </div>
        </div>
      </section>

      <section className={styles.cta}>
        <div className={styles.ctaGlow} />
        <h2>Empieza a gestionar tu biblioteca hoy</h2>
        <p>Crea tu cuenta gratis y descubre todas las funcionalidades</p>
        <Link to="/registro" className={styles.btnCta}>
          Crear Cuenta Gratis
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M5 12h14M12 5l7 7-7 7"/>
          </svg>
        </Link>
      </section>

      <footer className={styles.footer}>
        <div className={styles.footerInner}>
          <div className={styles.footerLogo}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"/>
              <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"/>
            </svg>
            <span>Biblioteca</span>
          </div>
          <p className={styles.footerText}>Sistema de Gestión Bibliotecaria. Todos los derechos reservados.</p>
        </div>
      </footer>
    </div>
  );
};

export default Landing;