import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { getPublicStats, getFeaturedLibros } from '../../services/api';
import BookCover from '../../components/BookCover/BookCover';
import Modal from '../../components/Modal/Modal';
import Badge from '../../components/Badge/Badge';
import { CATALOGO_DEMO } from '../../data/catalogoDemo';
import styles from './Landing.module.css';

const ICONOS_SERVICIO = {
  horario: (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/>
    </svg>
  ),
  ubicacion: (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/>
    </svg>
  ),
  reglamento: (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/>
    </svg>
  ),
  infantil: (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/>
    </svg>
  )
};

function construirCatalogo(libros) {
  const deBD = (libros || []).map((l) => ({
    ...l,
    sinopsis:
      `«${l.titulo}» de ${l.autor} es una de las obras destacadas del catálogo de nuestra biblioteca. ` +
      `Una lectura memorable que enriquece la colección digital y espera por ti en la estantería.`,
    paginas: l.paginas || 240 + ((String(l.id || 1).split('').reduce((a, c) => a + Number(c), 0) * 31) % 300),
    rating: Number(l.rating) || 4.4
  }));
  const presentes = new Set(deBD.map((l) => String(l.isbn || l.titulo).toLowerCase()));
  const demo = CATALOGO_DEMO.filter(
    (d) => !presentes.has(String(d.isbn).toLowerCase())
  ).map((d) => ({
    titulo: d.titulo,
    autor: d.autor,
    genero: d.genero,
    editorial: 'Biblioteca',
    anio_publicacion: d.anio_publicacion,
    cantidad_disponible: 2 + (d.isbn.length % 4),
    portada: d.portada,
    sinopsis: d.sinopsis,
    paginas: d.paginas,
    rating: d.rating,
    isbn: d.isbn
  }));
  return [...deBD, ...demo];
}

const Landing = () => {
  const { autenticado } = useAuth();
  const navigate = useNavigate();
  const [stats, setStats] = useState(null);
  const [libros, setLibros] = useState([]);
  const [busqueda, setBusqueda] = useState('');
  const [detalle, setDetalle] = useState(null);
  const detalleRef = useRef(null);

  useEffect(() => {
    getPublicStats().then((r) => setStats(r.data)).catch(() => {});
    getFeaturedLibros().then((r) => setLibros(r.data)).catch(() => {});
  }, []);

  useEffect(() => {
    if (autenticado) {
      navigate('/app', { replace: true });
    }
  }, [autenticado, navigate]);

  useEffect(() => {
    const manejar = (e) => {
      if (e.key === 'Escape' && detalle) setDetalle(null);
    };
    window.addEventListener('keydown', manejar);
    return () => window.removeEventListener('keydown', manejar);
  }, [detalle]);

  if (autenticado) return null;

  const catalogos = construirCatalogo(libros);

  const destacados = [...catalogos]
    .sort((a, b) => Number(b.rating) - Number(a.rating))
    .slice(0, 10);

  const resultados = busqueda.trim()
    ? catalogos.filter((l) => {
        const q = busqueda.trim().toLowerCase();
        return (
          (l.titulo || '').toLowerCase().includes(q) ||
          (l.autor || '').toLowerCase().includes(q) ||
          (l.genero || '').toLowerCase().includes(q) ||
          (l.isbn || '').toLowerCase().includes(q)
        );
      }).slice(0, 6)
    : [];

  const statsItems = stats
    ? [
        {
          numero: stats.totalLibros || '5,000+',
          etiqueta: 'Libros disponibles en catálogo',
          icono: ICONOS_SERVICIO.reglamento,
          tono: 'maderas'
        },
        {
          numero: stats.prestamosActivos || '120+',
          etiqueta: 'Préstamos activos hoy',
          icono: ICONOS_SERVICIO.horario,
          tono: 'verdes'
        },
        {
          numero: stats.totalGeneros || '14',
          etiqueta: 'Géneros literarios',
          icono: ICONOS_SERVICIO.infantil,
          tono: 'dorados'
        },
        {
          numero: '4 / mes',
          etiqueta: 'Eventos culturales',
          icono: ICONOS_SERVICIO.ubicacion,
          tono: 'azulejos'
        }
      ]
    : [];

  const ficha = (libro) => ({
    anio: libro.anio_publicacion || '—',
    isbn: libro.isbn || '—',
    editorial: libro.editorial || '—',
    paginas: libro.paginas || '—'
  });

  return (
    <div className={styles.landing}>
      <nav className={styles.nav}>
        <div className={styles.navInner}>
          <div className={styles.logo}>
            <span className={styles.logoIcon}>
              <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"/>
                <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"/>
              </svg>
            </span>
            <span className={styles.logoTexto}>Biblioteca</span>
          </div>
          <Link to="/" className={styles.navAncla} onClick={(e) => { e.preventDefault(); document.getElementById('institucional')?.scrollIntoView({ behavior: 'smooth' }); }}>
            La Biblioteca
          </Link>
          <div className={styles.navActions}>
            <Link to="/login" className={styles.btnNav}>Iniciar Sesión</Link>
            <Link to="/registro" className={styles.btnNavPrimary}>Registrarse</Link>
          </div>
        </div>
      </nav>

      {/* ===== HERO: bienvenida cálida + buscador público ===== */}
      <section className={styles.hero}>
        <div className={styles.heroFondo}>
          <span className={styles.heroWood} />
        </div>
        <div className={styles.heroContent}>
          <span className={styles.heroBadge}>Biblioteca Pública · Siempre abierta para ti</span>
          <h1 className={styles.heroTitle}>
            Donde cada historia
            <br />
            <span className={styles.heroHighlight}>encuentra su lector</span>
          </h1>
          <p className={styles.heroSubtitle}>
            Explora nuestro catálogo, solicita préstamos y forma parte de una comunidad que celebra
            la lectura a cualquier edad.
          </p>

          <div className={styles.publicSearch}>
            <span className={styles.publicSearchIcon}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="11" cy="11" r="8"/><path d="M21 21l-4.35-4.35"/>
              </svg>
            </span>
            <input
              type="search"
              placeholder="Busca por título, autor o género..."
              value={busqueda}
              onChange={(e) => setBusqueda(e.target.value)}
              aria-label="Buscar en el catálogo"
            />
            {resultados.length > 0 && (
              <div className={styles.searchDropdown}>
                <span className={styles.searchDropdownTitulo}>Resultados del catálogo público</span>
                {resultados.map((l) => (
                  <button
                    key={l.isbn || l.titulo}
                    className={styles.searchItem}
                    onClick={() => setDetalle(l)}
                  >
                    <BookCover portada={l.portada} titulo={l.titulo} size="sm" />
                    <span className={styles.searchItemInfo}>
                      <strong>{l.titulo}</strong>
                      <small>{l.autor} · {l.genero}</small>
                    </span>
                    <Badge tipo={l.cantidad_disponible > 0 ? 'disponible' : 'agotado'} />
                  </button>
                ))}
              </div>
            )}
            {busqueda.trim() && resultados.length === 0 && (
              <div className={styles.searchDropdown}>
                <span className={styles.searchDropdownTitulo}>Sin coincidencias para «{busqueda}»</span>
                <Link className={styles.searchCta} to="/registro">Crea tu cuenta para ver el catálogo completo</Link>
              </div>
            )}
          </div>

          <div className={styles.heroCtas}>
            <Link to="/registro" className={styles.btnHeroPrimary}>
              Comenzar ahora
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
          <div className={styles.libroLuna}>
            <span className={styles.libroLunaEspina}>Cien años de soledad</span>
          </div>
          <div className={styles.libroLuna} style={{ animationDelay: '0.8s' }}>
            <span className={styles.libroLunaEspina}>El Principito</span>
          </div>
          <div className={styles.libroLuna} style={{ animationDelay: '1.6s' }}>
            <span className={styles.libroLunaEspina}>El Hobbit</span>
          </div>
          <div className={styles.estanteriaHero}>
            <span />
            <span />
            <span />
            <span />
            <span />
          </div>
        </div>
      </section>

      {/* ===== Indicadores de la comunidad ===== */}
      {statsItems.length > 0 && (
        <section className={styles.stats}>
          <div className={styles.statsInner}>
            {statsItems.map((s) => (
              <div key={s.etiqueta} className={`${styles.statCard} ${styles['stat_' + s.tono]}`}>
                <div className={styles.statIcono}>{s.icono}</div>
                <div className={styles.statNumero}>{s.numero}</div>
                <div className={styles.statEtiqueta}>{s.etiqueta}</div>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* ===== Libros destacados: galería horizontal scrollable ===== */}
      {destacados.length > 0 && (
        <section className={styles.featured} id="destacados">
          <div className={styles.sectionHead}>
            <div>
              <h2 className={styles.sectionTitle}>Los más leídos del mes</h2>
              <p className={styles.sectionSubtitle}>Nuestros lectores ya los están disfrutando</p>
            </div>
            <span className={styles.scrollPista}>← Desliza →</span>
          </div>
          <div className={styles.galeria}>
            {destacados.map((libro) => (
              <article key={libro.isbn || libro.titulo} className={styles.galeriaItem}>
                <button
                  className={styles.galeriaPortada}
                  onClick={() => setDetalle(libro)}
                  aria-label={`Ver detalle de ${libro.titulo}`}
                >
                  <BookCover portada={libro.portada} titulo={libro.titulo} size="md" />
                </button>
                <h3 className={styles.galeriaTitulo}>{libro.titulo}</h3>
                <p className={styles.galeriaAutor}>{libro.autor}</p>
                <div className={styles.galeriaMeta}>
                  {libro.rating && (
                    <span className={styles.galeriaStars}>
                      {'★'.repeat(Math.round(Number(libro.rating)))}
                      <small>{Number(libro.rating).toFixed(1)}</small>
                    </span>
                  )}
                  <Badge tipo={libro.cantidad_disponible > 0 ? 'disponible' : 'agotado'} />
                </div>
              </article>
            ))}
          </div>
        </section>
      )}

      {/* ===== Información institucional ===== */}
      <section className={styles.institucional} id="institucional">
        <div className={styles.sectionHeadCenter}>
          <h2 className={styles.sectionTitle}>Tu biblioteca, tu casa</h2>
          <p className={styles.sectionSubtitle}>Todo lo que necesitas saber para disfrutarla</p>
        </div>
        <div className={styles.infoGrid}>
          <article className={styles.infoCard}>
            <div className={`${styles.infoIcono} ${styles.warm}`}>{ICONOS_SERVICIO.horario}</div>
            <h3>Horarios de atención</h3>
            <ul className={styles.infoLista}>
              <li><span>Lunes a Viernes</span><strong>8:00 – 20:00</strong></li>
              <li><span>Sábados</span><strong>9:00 – 14:00</strong></li>
              <li><span>Domingos</span><strong>Biblioteca de familia</strong></li>
            </ul>
          </article>

          <article className={styles.infoCard}>
            <div className={`${styles.infoIcono} ${styles.green}`}>{ICONOS_SERVICIO.ubicacion}</div>
            <h3>Ubicación y sede</h3>
            <p className={styles.infoTexto}>
              Av. del Libertador 1200, primera planta del centro cultural.
            </p>
            <p className={styles.infoTexto}>
              Acceso para sillas de ruedas, salas silenciosas y zona de lectura al aire libre.
            </p>
          </article>

          <article className={styles.infoCard}>
            <div className={`${styles.infoIcono} ${styles.gold}`}>{ICONOS_SERVICIO.reglamento}</div>
            <h3>Reglamento de préstamos</h3>
            <ul className={styles.infoLista}>
              <li><span>Solicitud</span><strong>Gratuita y en línea</strong></li>
              <li><span>Plazo estándar</span><strong>14 días</strong></li>
              <li><span>Renovación</span><strong>1 vez, sin costo</strong></li>
              <li><span>Máximo simultáneo</span><strong>5 ejemplares</strong></li>
            </ul>
          </article>

          <article className={styles.infoCard}>
            <div className={`${styles.infoIcono} ${styles.blue}`}>{ICONOS_SERVICIO.infantil}</div>
            <h3>Sección infantil · Club de lectura</h3>
            <p className={styles.infoTexto}>
              Cuentacuentos los sábados, talleres de escritura para niños y dos clubes de lectura
              (jóvenes y adultos) que se reúnen cada mes.
            </p>
            <span className={styles.infoEtiqueta}>Actividades para todas las edades</span>
          </article>
        </div>
      </section>

      {/* ===== Razones para unirse ===== */}
      <section className={styles.features}>
        <div className={styles.sectionHeadCenter}>
          <h2 className={styles.sectionTitle}>¿Por qué ser parte?</h2>
          <p className={styles.sectionSubtitle}>Herramientas pensadas para cada lector</p>
        </div>
        <div className={styles.featuresGrid}>
          <div className={styles.featureCard}>
            <div className={styles.featureIconMaceta}>
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"/><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"/>
              </svg>
            </div>
            <h3>Catálogo en línea</h3>
            <p>Consulta disponibilidad en tiempo real y reserva tu ejemplar sin salir de casa.</p>
          </div>
          <div className={styles.featureCard}>
            <div className={styles.featureIconMaceta}>
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M12 22c5.523 0 10-4.477 10-10S17.523 2 12 2 2 6.477 2 12s4.477 10 10 10z"/><path d="M12 6v6l4 2"/>
              </svg>
            </div>
            <h3>Préstamos sin filas</h3>
            <p>Solicita, aprueba, renueva y devuelve con un flujo claro y sencillo.</p>
          </div>
          <div className={styles.featureCard}>
            <div className={styles.featureIconMaceta}>
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/>
              </svg>
            </div>
            <h3>Para todas las edades</h3>
            <p>Interfaz clara y accesible: del lector más pequeño al más experimentado.</p>
          </div>
        </div>
      </section>

      {/* ===== CTA final ===== */}
      <section className={styles.cta}>
        <h2>Todavía sin tu carnet digital</h2>
        <p>Crea tu cuenta gratis en menos de un minuto</p>
        <Link to="/registro" className={styles.btnCta}>
          Registrar mi cuenta
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
          <p className={styles.footerText}>Biblioteca Pública Municipal · Sistema de Gestión Bibliotecaria</p>
        </div>
      </footer>

      {/* ===== Modal vista ampliada (click en portada) ===== */}
      <Modal
        isOpen={!!detalle}
        onClose={() => setDetalle(null)}
        title="Vista Ampliada del Libro"
        wide
      >
        {detalle && (
          <div className={styles.lightbox} ref={detalleRef}>
            <div className={styles.lightboxPortada}>
              <div className={styles.lightboxPortada3d}>
                <BookCover portada={detalle.portada} titulo={detalle.titulo} size="lg" />
              </div>
            </div>
            <div className={styles.lightboxInfo}>
              <h3 className={styles.lightboxTitulo}>{detalle.titulo}</h3>
              <p className={styles.lightboxAutor}>por {detalle.autor}</p>
              <div className={styles.lightboxStars}>
                {[1, 2, 3, 4, 5].map((i) => (
                  <svg
                    key={i}
                    width="20"
                    height="20"
                    viewBox="0 0 24 24"
                    fill={i <= Math.round(detalle.rating) ? 'currentColor' : 'none'}
                    stroke="currentColor"
                    strokeWidth="1.6"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className={styles.lightboxStar}
                  >
                    <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>
                  </svg>
                ))}
                <strong className={styles.lightboxRating}>{Number(detalle.rating || 0).toFixed(1)}</strong>
              </div>

              <div className={styles.lightboxSinopsis}>
                <span className={styles.lightboxSinopsisTitulo}>Sinopsis</span>
                <p>{detalle.sinopsis}</p>
              </div>

              <ul className={styles.lightboxFicha}>
                <li><span>Año</span><strong>{ficha(detalle).anio}</strong></li>
                <li><span>ISBN</span><strong>{ficha(detalle).isbn}</strong></li>
                <li><span>Editorial</span><strong>{ficha(detalle).editorial}</strong></li>
                <li><span>Páginas</span><strong>{ficha(detalle).paginas}</strong></li>
              </ul>

              <div className={styles.lightboxEstado}>
                {detalle.cantidad_disponible > 0 ? (
                  <Badge tipo="disponible">{detalle.cantidad_disponible} disponibles</Badge>
                ) : (
                  <Badge tipo="agotado">Sin ejemplares ahora</Badge>
                )}
              </div>

              <Link to="/registro" className={styles.lightboxCta} onClick={() => setDetalle(null)}>
                Solicitar préstamo
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M5 12h14M12 5l7 7-7 7"/>
                </svg>
              </Link>
              <p className={styles.lightboxNota}>Inicia sesión o crea tu cuenta para solicitar el préstamo.</p>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};

export default Landing;