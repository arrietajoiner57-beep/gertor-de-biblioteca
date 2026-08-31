import React, { useState, useEffect, useMemo, useRef } from 'react';
import Modal from '../../components/Modal/Modal';
import Badge from '../../components/Badge/Badge';
import BookCover from '../../components/BookCover/BookCover';
import ExportButtons from '../../components/ExportButtons/ExportButtons';
import { useAuth } from '../../context/AuthContext';
import { useToasts } from '../../context/ToastContext';
import {
  getLibros,
  getLibro,
  createLibro,
  updateLibro,
  deleteLibro,
  solicitarPrestamo,
  mensajeError
} from '../../services/api';
import { CATALOGO_DEMO } from '../../data/catalogoDemo';
import styles from './Libros.module.css';

const LIBRO_VACIO = {
  titulo: '',
  autor: '',
  isbn: '',
  editorial: '',
  anio_publicacion: '',
  genero: '',
  cantidad_disponible: 1,
  portada: ''
};

const FAV_KEY = 'biblioteca_favoritos';

const ICONOS_GENERO = {
  distopia: '🛸',
  fantasia: '🐉',
  fabula: '🧚',
  romance: '💞',
  clasico: '🏛️',
  realismo: '🪞',
  novela: '📚',
  realismomagico: '🌀',
  misterio: '🕵️',
  aventura: '🧭',
  epica: '⚔️',
  cienciaficcion: '🌌',
  terror: '👻',
  thriller: '🔪',
  tecnologia: '🚀',
  computadoras: '💻',
  informacion: '💡',
  historia: '📜',
  ciencia: '🔬',
  filosofia: '🧠',
  juvenile: '🧒',
  poesia: '🪶',
  biografico: '📖',
  educacion: '🎓',
  estudio: '📚',
  tradicion: '🧿'
};

const normalizaGenero = (g) => {
  if (!g) return 'general';
  return g
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '');
};

const iconoGenero = (g) => ICONOS_GENERO[normalizaGenero(g)] || '📘';

function Stars({ valor, size = 17 }) {
  const estrellas = Math.round(valor);
  return (
    <span className={styles.stars}>
      {[1, 2, 3, 4, 5].map((i) => (
        <svg
          key={i}
          width={size}
          height={size}
          viewBox="0 0 24 24"
          fill={i <= estrellas ? 'currentColor' : 'none'}
          stroke="currentColor"
          strokeWidth="1.6"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>
        </svg>
      ))}
      <span className={styles.starsValor}>{valor.toFixed(1)}</span>
    </span>
  );
}

/* Ficha demo de un libro (sinopsis, páginas, rating) o generada por defecto */
const fichaDemo = (libro) => {
  if (!libro) return null;
  const match = CATALOGO_DEMO.find(
    (d) =>
      (libro.isbn && d.isbn === libro.isbn) ||
      String(d.titulo).toLowerCase() === String(libro.titulo || '').toLowerCase()
  );
  if (match) return match;
  const hash = String(libro.id || 1).split('').reduce((a, c) => a + Number(c), 0);
  const rating = Math.min(5, (3.5 + (hash % 14) / 10).toFixed(1));
  const paginas = 120 + ((hash * 37) % 400);
  return {
    sinopsis: `«${libro.titulo || 'Este libro'}» de ${libro.autor || 'autor'} es una de las obras destacadas del catálogo. Sumérgete en sus páginas y descubre una historia inolvidable que enriquece la colección de la biblioteca.`,
    paginas,
    rating: Number(rating)
  };
};

const Libros = () => {
  const [libros, setLibros] = useState([]);
  const [busqueda, setBusqueda] = useState('');
  const [generoActivo, setGeneroActivo] = useState('todos');
  const [vista, setVista] = useState('mosaico');
  const [modalAbierto, setModalAbierto] = useState(false);
  const [detalleAbierto, setDetalleAbierto] = useState(false);
  const [currentBook, setCurrentBook] = useState(null);
  const [detalle, setDetalle] = useState(null);
  const [errorModal, setErrorModal] = useState('');
  const [solicitarModal, setSolicitarModal] = useState(false);
  const [libroSolicitar, setLibroSolicitar] = useState(null);
  const [cantidadSolicitar, setCantidadSolicitar] = useState(1);
  const [errorSolicitar, setErrorSolicitar] = useState('');
  const [formData, setFormData] = useState(LIBRO_VACIO);
  const [favoritos, setFavoritos] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem(FAV_KEY)) || [];
    } catch {
      return [];
    }
  });
  const buscadorRef = useRef(null);
  const { puedeGestionarCatalogo } = useAuth();
  const toasts = useToasts();

  /* Catálogo fusionado: datos reales + demo curado (garantiza riqueza visual) */
  const catalogo = useMemo(() => {
    const claves = new Set();
    const fusion = (libros || []).map((l) => {
      claves.add(normalizaGenero(l.genero));
      const f = fichaDemo(l);
      return { ...l, ...f };
    });
    const presentes = new Set(fusion.map((l) => String(l.isbn || l.titulo).toLowerCase()));
    const extra = CATALOGO_DEMO.filter(
      (d) => !presentes.has(String(d.isbn).toLowerCase())
    ).map((d) => ({
      titulo: d.titulo,
      autor: d.autor,
      isbn: d.isbn,
      editorial: 'Biblioteca',
      anio_publicacion: d.anio_publicacion,
      genero: d.genero,
      cantidad_disponible: 2 + (d.isbn.length % 4),
      portada: d.portada,
      sinopsis: d.sinopsis,
      paginas: d.paginas,
      rating: d.rating,
      _demo: true
    }));
    const resultado = [...fusion, ...extra];
    resultado.forEach((l) => claves.add(normalizaGenero(l.genero)));
    return resultado;
  }, [libros]);

  const generos = useMemo(() => {
    const set = new Set();
    catalogo.forEach((l) => l.genero && set.add(l.genero));
    return [...set];
  }, [catalogo]);

  const libroDestacado = useMemo(() => {
    return (
      catalogo.find((l) => l.destacado && !l._demo) ||
      catalogo.find((l) => l.portada) ||
      catalogo[0] ||
      null
    );
  }, [catalogo]);

  useEffect(() => {
    const temporizador = setTimeout(() => {
      fetchLibros(busqueda);
    }, 300);
    return () => clearTimeout(temporizador);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [busqueda]);

  const fetchLibros = async (q = '') => {
    try {
      const response = await getLibros(q);
      setLibros(response.data);
    } catch (error) {
      console.error('Error al obtener libros:', error);
    }
  };

  /* Filtrado instantáneo por título, autor, sinopsis o género */
  const librosFiltrados = useMemo(() => {
    const q = busqueda.trim().toLowerCase();
    return catalogo.filter((l) => {
      const coincideGenero = generoActivo === 'todos' ? true : normalizaGenero(l.genero) === normalizaGenero(generoActivo);
      const coincideTexto =
        !q ||
        (l.titulo || '').toLowerCase().includes(q) ||
        (l.autor || '').toLowerCase().includes(q) ||
        (l.sinopsis || '').toLowerCase().includes(q) ||
        (l.genero || '').toLowerCase().includes(q) ||
        (l.isbn || '').toLowerCase().includes(q);
      return coincideGenero && coincideTexto;
    });
  }, [catalogo, busqueda, generoActivo]);

  /* Atajo Ctrl/Cmd + K para enfocar el buscador del catálogo */
  useEffect(() => {
    const manejar = (e) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        if (buscadorRef.current) {
          buscadorRef.current.focus();
          buscadorRef.current.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
      }
    };
    window.addEventListener('keydown', manejar);
    return () => window.removeEventListener('keydown', manejar);
  }, []);

  const toggleFavorito = (id) => {
    setFavoritos((prev) => {
      const esFav = prev.includes(id);
      const next = esFav ? prev.filter((f) => f !== id) : [...prev, id];
      localStorage.setItem(FAV_KEY, JSON.stringify(next));
      toasts[esFav ? 'info' : 'exito'](
        esFav ? 'Eliminado de tus favoritos' : 'Añadido a tus favoritos',
        2200
      );
      return next;
    });
  };

  const handleOpenModal = (book = null) => {
    setErrorModal('');
    if (book) {
      setCurrentBook(book);
      setFormData({
        titulo: book.titulo,
        autor: book.autor,
        isbn: book.isbn,
        editorial: book.editorial || '',
        anio_publicacion: book.anio_publicacion || '',
        genero: book.genero || '',
        cantidad_disponible: book.cantidad_disponible,
        portada: book.portada || ''
      });
    } else {
      setCurrentBook(null);
      setFormData(LIBRO_VACIO);
    }
    setModalAbierto(true);
  };

  const verDetalle = async (book) => {
    try {
      const response = await getLibro(book.id);
      setDetalle({ ...response.data, ...fichaDemo(book) });
      setDetalleAbierto(true);
    } catch (error) {
      setDetalle({ ...book, ...fichaDemo(book) });
      setDetalleAbierto(true);
    }
  };

  const handleCloseModal = () => {
    setModalAbierto(false);
    setCurrentBook(null);
    setErrorModal('');
    setFormData(LIBRO_VACIO);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorModal('');

    try {
      if (currentBook) {
        await updateLibro(currentBook.id, formData);
        toasts.exito('Libro actualizado correctamente');
      } else {
        await createLibro(formData);
        toasts.exito('Libro creado correctamente');
      }
      fetchLibros(busqueda);
      handleCloseModal();
    } catch (error) {
      if (currentBook && currentBook._demo) {
        toasts.info('El libro de muestra no puede modificarse en la base de datos.', 3200);
        handleCloseModal();
      } else {
        setErrorModal(mensajeError(error));
      }
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('¿Estás seguro de eliminar este libro? Esta acción no se puede deshacer.')) {
      return;
    }
    try {
      const response = await deleteLibro(id);
      toasts.exito(response.data.message);
      fetchLibros(busqueda);
    } catch (error) {
      toasts.error(mensajeError(error));
    }
  };

  const handleOpenSolicitar = (book) => {
    setLibroSolicitar(book);
    setCantidadSolicitar(1);
    setErrorSolicitar('');
    setSolicitarModal(true);
  };

  const handleCloseSolicitar = () => {
    setSolicitarModal(false);
    setLibroSolicitar(null);
    setErrorSolicitar('');
  };

  const handleSolicitar = async (e) => {
    e.preventDefault();
    setErrorSolicitar('');

    if (libroSolicitar && libroSolicitar._demo) {
      toasts.info('Ejemplo visual: un préstamo real requiere el catálogo de la base de datos.', 3200);
      handleCloseSolicitar();
      return;
    }

    try {
      await solicitarPrestamo({
        libro_id: libroSolicitar.id,
        cantidad: cantidadSolicitar
      });
      toasts.exito('Solicitud de préstamo enviada. Esperando aprobación.');
      handleCloseSolicitar();
    } catch (error) {
      setErrorSolicitar(mensajeError(error));
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: name === 'cantidad_disponible' ? parseInt(value) || 0 : value
    });
  };

  return (
    <div className={styles.container}>
      {/* ===== Hero destacado ===== */}
      {libroDestacado && (
        <section
          className={styles.heroBanner}
          style={libroDestacado.portada ? { '--hero-img': `url("${libroDestacado.portada}")` } : {}}
        >
          <div className={styles.heroFondo} />
          <div className={styles.heroContent}>
            <div className={styles.heroPortada}>
              <div className={styles.heroPortada3d}>
                <BookCover portada={libroDestacado.portada} titulo={libroDestacado.titulo} size="lg" />
              </div>
            </div>
            <div className={styles.heroInfo}>
              <span className={styles.heroBadge}>✦ Libro destacado del mes</span>
              <h2 className={styles.heroTitulo}>{libroDestacado.titulo}</h2>
              <p className={styles.heroAutor}>por {libroDestacado.autor}</p>
              <div className={styles.heroChips}>
                {libroDestacado.genero && (
                  <span className={styles.chip}>{iconoGenero(libroDestacado.genero)} {libroDestacado.genero}</span>
                )}
                {libroDestacado.paginas && (
                  <span className={styles.chipCyan}>📖 {libroDestacado.paginas} págs.</span>
                )}
              </div>
              {libroDestacado.sinopsis && (
                <p className={styles.heroSinopsis}>
                  {String(libroDestacado.sinopsis).length > 180
                    ? `${String(libroDestacado.sinopsis).slice(0, 180)}…`
                    : libroDestacado.sinopsis}
                </p>
              )}
              <div className={styles.heroMeta}>
                <Stars valor={Number(libroDestacado.rating) || 0} />
                <Badge tipo={libroDestacado.cantidad_disponible > 0 ? 'disponible' : 'agotado'} />
              </div>
              {!puedeGestionarCatalogo && libroDestacado.cantidad_disponible > 0 && (
                <button
                  className={styles.reservarBtn}
                  onClick={() => handleOpenSolicitar(libroDestacado)}
                >
                  Solicitar préstamo
                  <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M5 12h14M12 5l7 7-7 7"/>
                  </svg>
                </button>
              )}
            </div>
          </div>
        </section>
      )}

      {/* ===== Header ===== */}
      <div className={styles.header}>
        <div>
          <h1 className={styles.title}>Catálogo de Libros</h1>
          <p className={styles.subtitle}>
            {puedeGestionarCatalogo
              ? 'Gestiona y enriquece la colección de la biblioteca'
              : 'Explora, descubre sinopsis y solicita tu próxima lectura'}
          </p>
        </div>
        <div className={styles.headerAcciones}>
          {puedeGestionarCatalogo && <ExportButtons seccion="libros" />}
          {puedeGestionarCatalogo && (
            <button className={styles.addBtn} onClick={() => handleOpenModal()}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>
              </svg>
              Nuevo Libro
            </button>
          )}
        </div>
      </div>

      {/* ===== Buscador con atajo + vista ===== */}
      <div className={styles.toolbar}>
        <div className={styles.buscadorWrap}>
          <span className={styles.buscadorLupa}>🔍</span>
          <input
            ref={buscadorRef}
            type="search"
            className={styles.buscador}
            placeholder="Buscar por título, autor, sinopsis o género..."
            value={busqueda}
            onChange={(e) => setBusqueda(e.target.value)}
          />
          <kbd className={styles.atajoBusqueda}>Ctrl K</kbd>
        </div>

        <div className={styles.vistaToggle}>
          <button
            className={`${styles.vistaBtn} ${vista === 'mosaico' ? styles.vistaActiva : ''}`}
            onClick={() => setVista('mosaico')}
            title="Mosaico 3D"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/>
              <rect x="14" y="14" width="7" height="7" rx="1"/><rect x="3" y="14" width="7" height="7" rx="1"/>
            </svg>
            Mosaico
          </button>
          <button
            className={`${styles.vistaBtn} ${vista === 'estanteria' ? styles.vistaActiva : ''}`}
            onClick={() => setVista('estanteria')}
            title="Estantería virtual"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="3" y1="3" x2="3" y2="21"/><line x1="21" y1="5" x2="21" y2="21"/><line x1="3" y1="12" x2="21" y2="9"/><line x1="3" y1="16" x2="21" y2="13"/>
            </svg>
            Estantería
          </button>
        </div>
      </div>

      {/* ===== Filtros por género (cápsulas animadas) ===== */}
      <div className={styles.chips}>
        <button
          className={`${styles.chip} ${generoActivo === 'todos' ? styles.chipActivo : ''}`}
          onClick={() => setGeneroActivo('todos')}
        >
          <span>✦</span> Todos
        </button>
        {generos.map((g) => (
          <button
            key={g}
            className={`${styles.chip} ${normalizaGenero(generoActivo) === normalizaGenero(g) ? styles.chipActivo : ''}`}
            onClick={() => setGeneroActivo(g)}
          >
            <span>{iconoGenero(g)}</span> {g}
          </button>
        ))}
      </div>

      {/* ===== Contador de resultados ===== */}
      <div className={styles.resultados}>
        <span>
          {librosFiltrados.length} {librosFiltrados.length === 1 ? 'libro encontrado' : 'libros encontrados'}
          {busqueda ? ` para «${busqueda}»` : ''}
        </span>
      </div>

      {/* ===== Catálogo ===== */}
      {vista === 'mosaico' ? (
        <div className={styles.mosaico}>
          {librosFiltrados.map((libro) => {
            const esDemo = !!libro._demo;
            return (
              <article key={libro.isbn || libro.id} className={styles.bookCard}>
                <button
                  className={`${styles.favBtn} ${favoritos.includes(libro.id || libro.isbn) ? styles.favActivo : ''}`}
                  onClick={() => toggleFavorito(libro.id || libro.isbn)}
                  aria-label="Añadir a favoritos"
                >
                  <svg width="17" height="17" viewBox="0 0 24 24" fill={favoritos.includes(libro.id || libro.isbn) ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/>
                  </svg>
                </button>
                <span className={`${styles.statusBadge} ${libro.cantidad_disponible > 0 ? styles.statusOk : styles.statusNo}`}>
                  {libro.cantidad_disponible > 0 ? 'Disponible' : 'Agotado'}
                </span>

                <div className={styles.cover3d}>
                  <div className={styles.cover3dInner}>
                    <BookCover portada={libro.portada} titulo={libro.titulo} size="md" />
                    <div className={styles.coverSheen} />
                  </div>
                </div>

                <div className={styles.cardBody}>
                  <h3 className={styles.cardTitulo}>{libro.titulo}</h3>
                  <p className={styles.cardAutor}>{libro.autor}</p>
                  <div className={styles.cardMeta}>
                    {libro.genero && <span className={styles.cardGenero}>{iconoGenero(libro.genero)} {libro.genero}</span>}
                    <span className={styles.cardStock}>{libro.cantidad_disponible} ej.</span>
                  </div>
                  <div className={styles.cardRating}>
                    <Stars valor={Number(libro.rating) || 0} size={14} />
                    {libro.paginas && <span className={styles.cardPaginas}>{libro.paginas} págs.</span>}
                  </div>
                </div>

                <div className={styles.hoverActions}>
                  <button className={styles.quickBtn} onClick={() => verDetalle(libro)}>
                    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/>
                    </svg>
                    Vista previa
                  </button>
                  {puedeGestionarCatalogo ? (
                    <>
                      <button
                        className={`${styles.quickBtn} ${styles.quickEditar}`}
                        onClick={() => handleOpenModal(libro)}
                      >
                        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
                        </svg>
                        Editar
                      </button>
                      <button
                        className={`${styles.quickBtn} ${styles.quickEliminar}`}
                        disabled={esDemo}
                        onClick={() => handleDelete(libro.id)}
                      >
                        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/>
                        </svg>
                        Eliminar
                      </button>
                    </>
                  ) : (
                    <button
                      className={`${styles.quickBtn} ${styles.quickSolicitar}`}
                      disabled={libro.cantidad_disponible === 0}
                      onClick={() => handleOpenSolicitar(libro)}
                    >
                      <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"/><line x1="3" y1="6" x2="21" y2="6"/><path d="M16 10a4 4 0 0 1-8 0"/>
                      </svg>
                      Solicitar
                    </button>
                  )}
                </div>
              </article>
            );
          })}
          {librosFiltrados.length === 0 && (
            <p className={styles.vacio}>No hay libros que coincidan con tus filtros.</p>
          )}
        </div>
      ) : (
        <div className={styles.estanteria}>
          {librosFiltrados.map((libro) => (
            <article key={libro.isbn || libro.id} className={styles.shelfRow}>
              <div className={styles.shelfCover}>
                <BookCover portada={libro.portada} titulo={libro.titulo} size="sm" />
              </div>
              <div className={styles.shelfInfo}>
                <h3>{libro.titulo}</h3>
                <p>{libro.autor} · {libro.isbn}</p>
                {libro.genero && <span className={styles.cardGenero}>{iconoGenero(libro.genero)} {libro.genero}</span>}
              </div>
              <div className={styles.shelfMeta}>
                <Stars valor={Number(libro.rating) || 0} size={14} />
                <Badge tipo={libro.cantidad_disponible > 0 ? 'disponible' : 'agotado'} />
              </div>
              <div className={styles.shelfAcciones}>
                <button className={styles.quickBtn} onClick={() => verDetalle(libro)}>Ver</button>
                {puedeGestionarCatalogo ? (
                  <>
                    <button className={`${styles.quickBtn} ${styles.quickEditar}`} onClick={() => handleOpenModal(libro)}>Editar</button>
                    <button className={`${styles.quickBtn} ${styles.quickEliminar}`} disabled={!!libro._demo} onClick={() => handleDelete(libro.id)}>Eliminar</button>
                  </>
                ) : (
                  <button
                    className={`${styles.quickBtn} ${styles.quickSolicitar}`}
                    disabled={libro.cantidad_disponible === 0}
                    onClick={() => handleOpenSolicitar(libro)}
                  >
                    Solicitar
                  </button>
                )}
              </div>
            </article>
          ))}
          {librosFiltrados.length === 0 && (
            <p className={styles.vacio}>No hay libros que coincidan con tus filtros.</p>
          )}
        </div>
      )}

      {/* ===== Modal quick view / detalle ===== */}
      <Modal isOpen={detalleAbierto} onClose={() => setDetalleAbierto(false)} title="Vista Prevía del Libro">
        {detalle && (
          <div className={styles.detalleWrap}>
            <div className={styles.detallePortada}>
              <div className={styles.detallePortada3d}>
                <BookCover portada={detalle.portada} titulo={detalle.titulo} size="lg" />
              </div>
            </div>
            <div className={styles.detalleInfo}>
              <h3 className={styles.detalleTitulo}>{detalle.titulo}</h3>
              <p className={styles.detalleAutor}>por {detalle.autor}</p>
              <div className={styles.detalleMeta}>
                <Stars valor={Number(detalle.rating) || 0} />
                {detalle.paginas && <span className={styles.detallePaginas}>📖 {detalle.paginas} páginas</span>}
              </div>
              {detalle.sinopsis && (
                <div className={styles.detalleSinopsis}>
                  <strong>Sinopsis</strong>
                  <p>{detalle.sinopsis}</p>
                </div>
              )}
              <div className={styles.detalleGrid}>
                <p><strong>ISBN:</strong> {detalle.isbn}</p>
                <p><strong>Editorial:</strong> {detalle.editorial || '-'}</p>
                <p><strong>Año:</strong> {detalle.anio_publicacion || '-'}</p>
                <p><strong>Género:</strong> {detalle.genero || '-'}</p>
              </div>
              <div className={styles.detalleEstado}>
                <Badge tipo={detalle.cantidad_disponible > 0 ? 'disponible' : 'agotado'} />
                <span className={styles.detalleEjemplares}>
                  {detalle.cantidad_disponible} ejemplares disponibles
                </span>
              </div>
              {!puedeGestionarCatalogo && detalle.cantidad_disponible > 0 && (
                <button
                  className={styles.reservarBtn}
                  onClick={() => {
                    setDetalleAbierto(false);
                    handleOpenSolicitar(detalle);
                  }}
                >
                  Solicitar este libro
                </button>
              )}
            </div>
          </div>
        )}
      </Modal>

      {/* ===== Modal solicitar ===== */}
      <Modal
        isOpen={solicitarModal}
        onClose={handleCloseSolicitar}
        title="Solicitar Préstamo"
      >
        <form onSubmit={handleSolicitar}>
          {errorSolicitar && (
            <div className={styles.errorAlerta} role="alert">{errorSolicitar}</div>
          )}

          {libroSolicitar && (
            <div className={styles.solicitarResumen}>
              <BookCover portada={libroSolicitar.portada} titulo={libroSolicitar.titulo} size="md" />
              <div>
                <h4>{libroSolicitar.titulo}</h4>
                <p>{libroSolicitar.autor}</p>
                <span className={styles.cardStock}>{libroSolicitar.cantidad_disponible} disponibles</span>
              </div>
            </div>
          )}

          <div className={styles.formGroup}>
            <label>Cantidad a solicitar *</label>
            <input
              type="number"
              min="1"
              max={libroSolicitar ? libroSolicitar.cantidad_disponible : 1}
              value={cantidadSolicitar}
              onChange={(e) => setCantidadSolicitar(parseInt(e.target.value) || 1)}
              required
            />
          </div>

          <p className={styles.notaFecha}>
            La fecha de devolución será 14 días a partir de hoy.
          </p>

          <div className={styles.formActions}>
            <button type="button" className={styles.btnSecondary} onClick={handleCloseSolicitar}>
              Cancelar
            </button>
            <button type="submit" className={styles.btnPrimary}>
              Enviar Solicitud
            </button>
          </div>
        </form>
      </Modal>

      {/* ===== Modal crear/editar ===== */}
      <Modal
        isOpen={modalAbierto}
        onClose={handleCloseModal}
        title={currentBook ? 'Editar Libro' : 'Nuevo Libro'}
      >
        <form onSubmit={handleSubmit}>
          {errorModal && (
            <div className={styles.errorAlerta} role="alert">{errorModal}</div>
          )}

          <div className={styles.formGroup}>
            <label>Título *</label>
            <input type="text" name="titulo" value={formData.titulo} onChange={handleChange} required />
          </div>
          <div className={styles.formGroup}>
            <label>Autor *</label>
            <input type="text" name="autor" value={formData.autor} onChange={handleChange} required />
          </div>
          <div className={styles.formGroup}>
            <label>ISBN *</label>
            <input type="text" name="isbn" value={formData.isbn} onChange={handleChange} required />
          </div>
          <div className={styles.formGroup}>
            <label>Editorial</label>
            <input type="text" name="editorial" value={formData.editorial} onChange={handleChange} />
          </div>
          <div className={styles.formRow}>
            <div className={styles.formGroup}>
              <label>Año Publicación</label>
              <input type="number" name="anio_publicacion" value={formData.anio_publicacion} onChange={handleChange} />
            </div>
            <div className={styles.formGroup}>
              <label>Cantidad Disponible *</label>
              <input type="number" name="cantidad_disponible" value={formData.cantidad_disponible} onChange={handleChange} min="0" required />
            </div>
          </div>
          <div className={styles.formGroup}>
            <label>Género</label>
            <input type="text" name="genero" value={formData.genero} onChange={handleChange} />
          </div>
          <div className={styles.formGroup}>
            <label>URL de la portada</label>
            <input
              type="url"
              name="portada"
              value={formData.portada}
              onChange={handleChange}
              placeholder="https://covers.openlibrary.org/b/isbn/XXXX-L.jpg"
            />
            {formData.portada && (
              <div className={styles.portadaPreview}>
                <BookCover portada={formData.portada} titulo={formData.titulo} size="sm" />
              </div>
            )}
          </div>
          <div className={styles.formActions}>
            <button type="button" className={styles.btnSecondary} onClick={handleCloseModal}>
              Cancelar
            </button>
            <button type="submit" className={styles.btnPrimary}>
              {currentBook ? 'Actualizar' : 'Guardar'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default Libros;
