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
            <span>Biblioteca</span>
          </div>
          <div className={styles.navActions}>
            <Link to="/login" className={styles.btnNav}>Iniciar Sesion</Link>
            <Link to="/registro" className={styles.btnNavPrimary}>Registrarse</Link>
          </div>
        </div>
      </nav>

      <section className={styles.hero}>
        <div className={styles.heroContent}>
          <span className={styles.heroBadge}>Sistema de Gestion Bibliotecaria</span>
          <h1 className={styles.heroTitle}>
            Tu biblioteca,<br />
            <span className={styles.heroHighlight}>siempre a tu alcance</span>
          </h1>
          <p className={styles.heroSubtitle}>
            Administra tu catalogo de libros, gestiona prestamos y lleva un control
            completo de tu biblioteca con una plataforma moderna y facil de usar.
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
          <div className={styles.heroCard}>
            <div className={styles.heroCardIcon}>
              <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="var(--color-accent)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"/>
                <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"/>
              </svg>
            </div>
            <div className={styles.heroCardLines}>
              <div className={styles.lineLong} />
              <div className={styles.lineMedium} />
              <div className={styles.lineShort} />
            </div>
          </div>
        </div>
      </section>

      {stats && (
        <section className={styles.stats}>
          <div className={styles.statsGrid}>
            <div className={styles.statCard}>
              <div className={styles.statNumber}>{stats.totalLibros}</div>
              <div className={styles.statLabel}>Libros en Catalogo</div>
            </div>
            <div className={styles.statCard}>
              <div className={styles.statNumber}>{stats.librosDisponibles}</div>
              <div className={styles.statLabel}>Ejemplares Disponibles</div>
            </div>
            <div className={styles.statCard}>
              <div className={styles.statNumber}>{stats.totalGeneros}</div>
              <div className={styles.statLabel}>Generos</div>
            </div>
            <div className={styles.statCard}>
              <div className={styles.statNumber}>{stats.prestamosActivos}</div>
              <div className={styles.statLabel}>Prestamos Activos</div>
            </div>
          </div>
        </section>
      )}

      {libros.length > 0 && (
        <section className={styles.featured}>
          <h2 className={styles.sectionTitle}>Libros Destacados</h2>
          <p className={styles.sectionSubtitle}>Descubre algunos de los libros disponibles en nuestro catalogo</p>
          <div className={styles.booksGrid}>
            {libros.map((libro) => (
              <div key={libro.id} className={styles.bookCard}>
                <div className={styles.bookCoverWrap}>
                  <BookCover portada={libro.portada} titulo={libro.titulo} size="md" />
                </div>
                <div className={styles.bookInfo}>
                  <h3 className={styles.bookTitle}>{libro.titulo}</h3>
                  <p className={styles.bookAuthor}>{libro.autor}</p>
                  {libro.genero && (
                    <span className={styles.bookGenre}>{libro.genero}</span>
                  )}
                  <span className={`${styles.bookStatus} ${libro.cantidad_disponible > 0 ? styles.statusAvailable : styles.statusUnavailable}`}>
                    {libro.cantidad_disponible > 0 ? `${libro.cantidad_disponible} disponibles` : 'Agotado'}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      <section className={styles.features}>
        <h2 className={styles.sectionTitle}>Por que usar nuestra plataforma</h2>
        <p className={styles.sectionSubtitle}>Herramientas disenadas para simplificar la gestion bibliotecaria</p>
        <div className={styles.featuresGrid}>
          <div className={styles.featureCard}>
            <div className={styles.featureIcon}>
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="11" cy="11" r="8"/><path d="M21 21l-4.35-4.35"/>
              </svg>
            </div>
            <h3>Busqueda Avanzada</h3>
            <p>Encuentra cualquier libro por titulo, autor, genero o ISBN de forma instantanea.</p>
          </div>
          <div className={styles.featureCard}>
            <div className={styles.featureIcon}>
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M12 22c5.523 0 10-4.477 10-10S17.523 2 12 2 2 6.477 2 12s4.477 10 10 10z"/>
                <path d="M12 6v6l4 2"/>
              </svg>
            </div>
            <h3>Gestion de Prestamos</h3>
            <p>Solicita, aprueba y controla prestamos con seguimiento de fechas y estados en tiempo real.</p>
          </div>
          <div className={styles.featureCard}>
            <div className={styles.featureIcon}>
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/>
                <circle cx="9" cy="7" r="4"/>
                <path d="M23 21v-2a4 4 0 0 0-3-3.87"/>
                <path d="M16 3.13a4 4 0 0 1 0 7.75"/>
              </svg>
            </div>
            <h3>Multi-usuario</h3>
            <p>Sistema de roles que permite administradores, bibliotecarios y usuarios con permisos diferenciados.</p>
          </div>
          <div className={styles.featureCard}>
            <div className={styles.featureIcon}>
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <rect x="3" y="3" width="18" height="18" rx="2" ry="2"/>
                <path d="M3 9h18M9 21V9"/>
              </svg>
            </div>
            <h3>Panel de Control</h3>
            <p>Estadisticas y graficos que ofrecen una vision completa de la actividad de la biblioteca.</p>
          </div>
        </div>
      </section>

      <section className={styles.cta}>
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
          <p className={styles.footerText}>Sistema de Gestion Bibliotecaria. Todos los derechos reservados.</p>
        </div>
      </footer>
    </div>
  );
};

export default Landing;
