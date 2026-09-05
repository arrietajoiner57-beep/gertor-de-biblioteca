import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useToasts } from '../../context/ToastContext';
import { Avatar, VerEstrellas, SelectorEstrellas } from '../../components/Resenas/Resenas.jsx';
import {
  getLibros,
  getResenasRecientes,
  crearResena,
  toggleLikeResena,
  eliminarResena,
  getSugerencias,
  crearSugerencia,
  votarSugerencia,
  cambiarEstadoSugerencia,
  eliminarSugerencia,
  mensajeError
} from '../../services/api';
import styles from './Comunidad.module.css';

const PUBLICOS = {
  todo: 'Todo público',
  ninos: 'Ideal para niños',
  jovenes: 'Ideal para jóvenes',
  adultos_mayores: 'Ideal para adultos mayores'
};

const ESTADOS_SUGERENCIA = {
  revision: { label: 'En Revisión', clase: 'revision', icono: '⏳' },
  aprobado: { label: 'Aprobado / En Adquisición', clase: 'aprobado', icono: '📥' },
  en_biblioteca: { label: '¡Ya en Biblioteca!', clase: 'enBiblioteca', icono: '✅' }
};

function formatearFecha(valor) {
  if (!valor) return '';
  const [fecha, hora] = String(valor).split(' ');
  if (!fecha) return '';
  const partes = fecha.split('-');
  if (partes.length !== 3) return fecha;
  return `${partes[2]}/${partes[1]}/${partes[0]}${hora ? ` · ${hora.slice(0, 5)}` : ''}`;
}

function BadgeEstado({ estado }) {
  const info = ESTADOS_SUGERENCIA[estado] || ESTADOS_SUGERENCIA.revision;
  return (
    <span className={`${styles.badgeEstado} ${styles[info.clase]}`}>
      <span className={styles.badgeIcono}>{info.icono}</span>
      {info.label}
    </span>
  );
}

/* ===== Muro de reseñas recientes de toda la comunidad ===== */
const MuroResenas = () => {
  const { usuario } = useAuth();
  const toasts = useToasts();
  const [cargando, setCargando] = useState(true);
  const [resenas, setResenas] = useState([]);

  const [escribiendo, setEscribiendo] = useState(false);
  const [libros, setLibros] = useState([]);
  const [libroId, setLibroId] = useState('');
  const [estrellas, setEstrellas] = useState(0);
  const [comentario, setComentario] = useState('');
  const [publico, setPublico] = useState('todo');
  const [enviando, setEnviando] = useState(false);
  const [errorForm, setErrorForm] = useState('');
  const [gracia, setGracia] = useState(false);

  const cargar = useCallback(async () => {
    try {
      const response = await getResenasRecientes(40);
      setResenas(response.data);
    } catch (error) {
      toasts.error(mensajeError(error, 'No se pudieron cargar las reseñas'));
    } finally {
      setCargando(false);
    }
  }, [toasts]);

  useEffect(() => {
    cargar();
    getLibros()
      .then((response) => setLibros(response.data))
      .catch(() => {});
  }, [cargar]);

  const publicar = async (e) => {
    e.preventDefault();
    setErrorForm('');

    if (!libroId) {
      setErrorForm('Elige el libro del catálogo que quieres reseñar.');
      return;
    }
    if (estrellas < 1) {
      setErrorForm('Elige entre 1 y 5 estrellas para calificar el libro.');
      return;
    }
    if (!comentario.trim()) {
      setErrorForm('Escribe tu opinión antes de publicar.');
      return;
    }

    setEnviando(true);
    try {
      await crearResena({
        libro_id: Number(libroId),
        calificacion: estrellas,
        comentario: comentario.trim(),
        publico_recomendado: publico
      });
      setLibroId('');
      setEstrellas(0);
      setComentario('');
      setPublico('todo');
      setEscribiendo(false);
      setGracia(true);
      setTimeout(() => setGracia(false), 6000);
      toasts.exito('¡Gracias por compartir tu opinión!');
      cargar();
    } catch (error) {
      setErrorForm(mensajeError(error));
    } finally {
      setEnviando(false);
    }
  };

  const alternarLike = async (resena) => {
    try {
      const response = await toggleLikeResena(resena.id);
      setResenas((actual) =>
        actual.map((r) =>
          r.id === resena.id
            ? { ...r, likes: response.data.likes, yo_like: response.data.yo_like ? 1 : 0 }
            : r
        )
      );
    } catch (error) {
      toasts.error(mensajeError(error));
    }
  };

  const borrar = async (resena) => {
    if (!window.confirm('¿Eliminar esta opinión?')) return;
    try {
      await eliminarResena(resena.id);
      toasts.exito('La opinión fue eliminada');
      cargar();
    } catch (error) {
      toasts.error(mensajeError(error));
    }
  };

  return (
    <div className={styles.tabContenido}>
      <div className={styles.intro}>
        <h2 className={styles.introTitulo}>Muro de Reseñas</h2>
        <p className={styles.introTexto}>
          Lee lo que otros lectores opinan sobre los libros de la biblioteca y
          marca como <strong>Útil</strong> las reseñas que más te sirvan.
          También puedes dejar tu propia opinión aquí, sin salir de esta página.
        </p>
      </div>

      <div className={styles.escribirBarra}>
        <div className={styles.escribirTexto}>
          <strong>¿Ya terminaste un libro?</strong>
          <p>Escríbele una reseña a la comunidad con solo un par de clics.</p>
        </div>
        <button
          type="button"
          className={styles.btnEscribir}
          onClick={() => setEscribiendo((v) => !v)}
          aria-expanded={escribiendo}
        >
          <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M12 20h9"/><path d="M16.5 3.5a2.12 2.12 0 0 1 3 3L7 19l-4 1 1-4Z"/>
          </svg>
          {escribiendo ? 'Cerrar formulario' : 'Escribir una reseña'}
        </button>
      </div>

      {escribiendo && (
        <form className={styles.formaSugerencia} onSubmit={publicar}>
          {gracia && (
            <div className={styles.banner} role="status">
              <span className={styles.bannerIcono}>💛</span>
              <div>
                <strong>¡Gracias por compartir tu opinión!</strong>
                <p>Tu reseña ya aparece en el muro de la comunidad.</p>
              </div>
            </div>
          )}
          {errorForm && <div className={styles.errorAlerta} role="alert">{errorForm}</div>}

          <div className={styles.campoForma}>
            <label className={styles.etiquetaForma} htmlFor="muro-resena-libro">
              ¿Sobre qué libro quieres opinar? *
            </label>
            <select
              id="muro-resena-libro"
              className={styles.inputForma}
              value={libroId}
              onChange={(e) => setLibroId(e.target.value)}
            >
              <option value="">Elige un libro del catálogo…</option>
              {libros.map((libro) => (
                <option key={libro.id} value={libro.id}>
                  {libro.titulo} — {libro.autor}
                </option>
              ))}
            </select>
          </div>

          <div className={styles.campoForma}>
            <span className={styles.etiquetaForma}>¿Cuántas estrellas le das? *</span>
            <SelectorEstrellas valor={estrellas} onChange={setEstrellas} />
          </div>

          <div className={styles.campoForma}>
            <label className={styles.etiquetaForma} htmlFor="muro-resena-comentario">
              Tu opinión o reflexión sobre la lectura *
            </label>
            <textarea
              id="muro-resena-comentario"
              className={styles.inputForma}
              rows={4}
              maxLength={1500}
              value={comentario}
              onChange={(e) => setComentario(e.target.value)}
              placeholder="Cuéntale a la comunidad qué te pareció el libro, qué te hizo sentir..."
              required
            />
          </div>

          <div className={styles.campoForma}>
            <label className={styles.etiquetaForma} htmlFor="muro-resena-publico">
              Nivel de lectura / Recomendado para
            </label>
            <select
              id="muro-resena-publico"
              className={styles.inputForma}
              value={publico}
              onChange={(e) => setPublico(e.target.value)}
            >
              {Object.entries(PUBLICOS).map(([clave, etiqueta]) => (
                <option key={clave} value={clave}>{etiqueta}</option>
              ))}
            </select>
          </div>

          <div className={styles.accionesForma}>
            <button type="submit" className={styles.btnEnviar} disabled={enviando}>
              {enviando ? 'Publicando...' : 'Publicar mi reseña'}
            </button>
          </div>
        </form>
      )}

      {cargando && <p className={styles.vacio}>Cargando reseñas...</p>}

      {!cargando && resenas.length === 0 && (
        <p className={styles.vacio}>
          Aún no hay reseñas publicadas. Usa el botón <strong>«Escribir una reseña»</strong> y
          sé la primera persona en compartir tu opinión.
        </p>
      )}

      <div className={styles.muroResenas}>
        {resenas.map((resena) => (
          <article key={resena.id} className={styles.tarjetaResena}>
            <div className={styles.cabeceraResena}>
              <div className={styles.libroMini}>
                {resena.libro_portada ? (
                  <img src={resena.libro_portada} alt="" className={styles.libroMiniImg} loading="lazy" />
                ) : (
                  <span className={styles.libroMiniLetra}>
                    {String(resena.libro_titulo || '?').charAt(0).toUpperCase()}
                  </span>
                )}
                <div className={styles.libroMiniInfo}>
                  <span className={styles.libroMiniBanda}>Reseña sobre</span>
                  <strong>{resena.libro_titulo}</strong>
                  <small>{resena.libro_autor}</small>
                </div>
              </div>
              <VerEstrellas valor={resena.calificacion} size={17} />
            </div>

            <div className={styles.filaAutor}>
              <Avatar nombre={resena.nombre_usuario} rol={resena.rol_usuario} />
              <div className={styles.infoAutor}>
                <strong>{resena.nombre_usuario}</strong>
                <span className={styles.fecha}>{formatearFecha(resena.fecha_creacion)}</span>
              </div>
              <span className={styles.chipRecomendado}>
                {PUBLICOS[resena.publico_recomendado] || resena.publico_recomendado}
              </span>
            </div>

            <p className={styles.comentario}>{resena.comentario}</p>

            <div className={styles.accionesResena}>
              {resena.usuario_id !== (usuario && usuario.id) && (
                <button
                  type="button"
                  className={`${styles.btnUtil} ${resena.yo_like ? styles.btnUtilActivo : ''}`}
                  onClick={() => alternarLike(resena)}
                  aria-pressed={!!resena.yo_like}
                >
                  <svg width="15" height="15" viewBox="0 0 24 24" fill={resena.yo_like ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M14 9V5a3 3 0 0 0-3-3l-4 9v11h11.28a2 2 0 0 0 2-1.7l1.38-9a2 2 0 0 0-2-2.3zM7 22H4a2 2 0 0 1-2-2v-7a2 2 0 0 1 2-2h3"/>
                  </svg>
                  Útil <span className={styles.contador}>{resena.likes}</span>
                </button>
              )}
              {usuario && (resena.usuario_id === usuario.id || ['admin', 'bibliotecario'].includes(usuario.rol)) && (
                <button type="button" className={styles.btnBorrar} onClick={() => borrar(resena)}>
                  Eliminar
                </button>
              )}
            </div>
          </article>
        ))}
      </div>
    </div>
  );
};

/* ===== Buzón de Sugerencias: formulario + "Los más pedidos" ===== */
const Buzon = () => {
  const { usuario, puedeGestionarCatalogo } = useAuth();
  const toasts = useToasts();

  const [cargando, setCargando] = useState(true);
  const [sugerencias, setSugerencias] = useState([]);
  const [form, setForm] = useState({ titulo: '', autor: '', categoria: '', motivo: '' });
  const [enviando, setEnviando] = useState(false);
  const [errorForm, setErrorForm] = useState('');
  const [gracia, setGracia] = useState(false);

  const cargar = useCallback(async () => {
    try {
      const response = await getSugerencias();
      setSugerencias(response.data);
    } catch (error) {
      toasts.error(mensajeError(error, 'No se pudieron cargar las sugerencias'));
    } finally {
      setCargando(false);
    }
  }, [toasts]);

  useEffect(() => {
    cargar();
  }, [cargar]);

  const cambiar = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const enviar = async (e) => {
    e.preventDefault();
    setErrorForm('');

    if (!form.titulo.trim() || !form.autor.trim()) {
      setErrorForm('Indica el título y el autor del libro que te gustaría encontrar.');
      return;
    }

    setEnviando(true);
    try {
      await crearSugerencia({
        titulo: form.titulo.trim(),
        autor: form.autor.trim(),
        categoria: form.categoria.trim(),
        motivo: form.motivo.trim()
      });
      setForm({ titulo: '', autor: '', categoria: '', motivo: '' });
      setGracia(true);
      setTimeout(() => setGracia(false), 6000);
      cargar();
    } catch (error) {
      setErrorForm(mensajeError(error));
    } finally {
      setEnviando(false);
    }
  };

  const votar = async (sugerencia) => {
    try {
      const response = await votarSugerencia(sugerencia.id);
      setSugerencias((actual) =>
        actual
          .map((s) =>
            s.id === sugerencia.id
              ? { ...s, votos: response.data.votos, yo_voto: response.data.yo_voto ? 1 : 0 }
              : s
          )
          .sort((a, b) => b.votos - a.votos)
      );
    } catch (error) {
      toasts.error(mensajeError(error));
    }
  };

  const cambiarEstado = async (sugerencia, nuevoEstado) => {
    try {
      const response = await cambiarEstadoSugerencia(sugerencia.id, nuevoEstado);
      toasts.exito(response.data.message);
      setSugerencias((actual) =>
        actual.map((s) => (s.id === sugerencia.id ? { ...s, estado: nuevoEstado } : s))
      );
    } catch (error) {
      toasts.error(mensajeError(error));
    }
  };

  const borrar = async (sugerencia) => {
    if (!window.confirm('¿Eliminar esta sugerencia?')) return;
    try {
      await eliminarSugerencia(sugerencia.id);
      toasts.exito('La sugerencia fue eliminada');
      cargar();
    } catch (error) {
      toasts.error(mensajeError(error));
    }
  };

  const totalVotos = sugerencias.reduce((acc, s) => acc + (Number(s.votos) || 0), 0);

  return (
    <div className={styles.tabContenido}>
      <div className={styles.intro}>
        <h2 className={styles.introTitulo}>Buzón de Sugerencias de Libros</h2>
        <p className={styles.introTexto}>
          ¿No encuentras ese libro que tanto quieres leer? Pídelo aquí.
          La biblioteca revisa las peticiones y prioriza las más pedidas por la comunidad.
        </p>
      </div>

      <form className={styles.formaSugerencia} onSubmit={enviar}>
        {gracia && (
          <div className={styles.banner} role="status">
            <span className={styles.bannerIcono}>📚</span>
            <div>
              <strong>¡Gracias por tu sugerencia!</strong>
              <p>La biblioteca la revisará pronto. Tus vecinos ya pueden votar por ella.</p>
            </div>
          </div>
        )}
        {errorForm && <div className={styles.errorAlerta} role="alert">{errorForm}</div>}

        <div className={styles.filaForma}>
          <div className={styles.campoForma}>
            <label className={styles.etiquetaForma} htmlFor="sug-titulo">Título del libro *</label>
            <input
              id="sug-titulo"
              type="text"
              name="titulo"
              className={styles.inputForma}
              value={form.titulo}
              onChange={cambiar}
              maxLength={200}
              placeholder="Ej. La ciudad de las bestias"
              required
            />
          </div>
          <div className={styles.campoForma}>
            <label className={styles.etiquetaForma} htmlFor="sug-autor">Autor *</label>
            <input
              id="sug-autor"
              type="text"
              name="autor"
              className={styles.inputForma}
              value={form.autor}
              onChange={cambiar}
              maxLength={150}
              placeholder="Ej. Isabel Allende"
              required
            />
          </div>
          <div className={styles.campoForma}>
            <label className={styles.etiquetaForma} htmlFor="sug-categoria">Categoría / Género</label>
            <input
              id="sug-categoria"
              type="text"
              name="categoria"
              className={styles.inputForma}
              value={form.categoria}
              onChange={cambiar}
              maxLength={100}
              placeholder="Ej. Novela juvenil, Ciencia ficción..."
            />
          </div>
        </div>

        <div className={styles.campoForma}>
          <label className={styles.etiquetaForma} htmlFor="sug-motivo">
            ¿Por qué te gustaría que la biblioteca lo tenga?
          </label>
          <textarea
            id="sug-motivo"
            name="motivo"
            className={styles.inputForma}
            rows={3}
            maxLength={1000}
            value={form.motivo}
            onChange={cambiar}
            placeholder="Opción libre: cuéntanos por qué crees que toda la comunidad debería leerlo..."
          />
        </div>

        <div className={styles.accionesForma}>
          <button type="submit" className={styles.btnEnviar} disabled={enviando}>
            {enviando ? 'Enviando...' : 'Enviar Sugerencia a la Biblioteca'}
          </button>
        </div>
      </form>

      <div className={styles.masPedidosCabecera}>
        <div>
          <h3 className={styles.masPedidosTitulo}>Los Más Pedidos</h3>
          <p className={styles.masPedidosSub}>
            Vota por las sugerencias que te gustan para que la biblioteca las adquiera primero.
          </p>
        </div>
        <div className={styles.masPedidosMeta}>
          <span className={styles.metaContador}>{sugerencias.length}</span>
          <span>sugerencias</span>
          <span className={styles.metaContador}>{totalVotos}</span>
          <span>votos</span>
        </div>
      </div>

      {cargando && <p className={styles.vacio}>Cargando sugerencias...</p>}

      {!cargando && sugerencias.length === 0 && (
        <p className={styles.vacio}>
          Todavía no hay peticiones. ¡Sé la primera persona en sugerir un libro!
        </p>
      )}

      <div className={styles.gridSugerencias}>
        {sugerencias.map((s, indice) => {
          const esPropia = s.usuario_id === (usuario && usuario.id);
          return (
            <article key={s.id} className={`${styles.tarjetaSugerencia} ${s.yo_voto ? styles.tarjetaVotada : ''}`}>
              <div className={styles.sugTop}>
                <span className={styles.sugPuesto}>#{indice + 1}</span>
                <BadgeEstado estado={s.estado} />
              </div>

              <button
                type="button"
                className={`${styles.btnVoto} ${s.yo_voto ? styles.btnVotoActivo : ''}`}
                onClick={() => votar(s)}
                disabled={esPropia}
                title={esPropia ? 'No puedes votar por tu propia sugerencia' : 'Votar por esta sugerencia'}
                aria-pressed={!!s.yo_voto}
                aria-label={`Votar por ${s.titulo}`}
              >
                <svg width="20" height="20" viewBox="0 0 24 24" fill={s.yo_voto ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/>
                </svg>
                <strong>{s.votos}</strong>
                <span>{s.votos === 1 ? 'voto' : 'votos'}</span>
              </button>

              <div className={styles.sugCuerpo}>
                <h4 className={styles.sugTitulo}>{s.titulo}</h4>
                <p className={styles.sugAutor}>por {s.autor}</p>
                {s.categoria && <span className={styles.sugCategoria}>{s.categoria}</span>}
                {s.motivo && <p className={styles.sugMotivo}>“{s.motivo}”</p>}
              </div>

              <div className={styles.sugFooter}>
                <div className={styles.sugUsuario}>
                  <Avatar nombre={s.nombre_usuario} rol={s.rol_usuario} />
                  <div>
                    <strong>{s.nombre_usuario}</strong>
                    <span className={styles.fecha}>{formatearFecha(s.fecha_creacion)}</span>
                  </div>
                </div>

                {puedeGestionarCatalogo && (
                  <select
                    className={styles.selectEstado}
                    value={s.estado}
                    onChange={(e) => cambiarEstado(s, e.target.value)}
                    aria-label={`Estado de la solicitud de ${s.titulo}`}
                  >
                    {Object.entries(ESTADOS_SUGERENCIA).map(([clave, info]) => (
                      <option key={clave} value={clave}>{info.label}</option>
                    ))}
                  </select>
                )}

                {usuario && (esPropia || ['admin', 'bibliotecario'].includes(usuario.rol)) && (
                  <button
                    type="button"
                    className={styles.btnBorrar}
                    onClick={() => borrar(s)}
                    aria-label={`Eliminar sugerencia de ${s.titulo}`}
                  >
                    Eliminar
                  </button>
                )}
              </div>

              {esPropia && <div className={styles.tuSugerencia}>La pediste tú</div>}
            </article>
          );
        })}
      </div>
    </div>
  );
};

const Comunidad = () => {
  const [tab, setTab] = useState('reseñas');

  return (
    <div className={styles.container}>
      <header className={styles.header}>
        <div>
          <span className={styles.eyebrow}>Comunidad</span>
          <h1 className={styles.titulo}>Comunidad y Sugerencias</h1>
          <p className={styles.subtitulo}>
            Comparte opiniones, recomienda lecturas y pide los libros que quieres tener en la biblioteca
          </p>
        </div>
      </header>

      <nav className={styles.tabs} role="tablist" aria-label="Secciones de la comunidad">
        <button
          type="button"
          role="tab"
          aria-selected={tab === 'reseñas'}
          className={`${styles.tab} ${tab === 'reseñas' ? styles.tabActivo : ''}`}
          onClick={() => setTab('reseñas')}
        >
          <span className={styles.tabIcono} aria-hidden="true">✍️</span>
          Muro de Reseñas
        </button>
        <button
          type="button"
          role="tab"
          aria-selected={tab === 'sugerencias'}
          className={`${styles.tab} ${tab === 'sugerencias' ? styles.tabActivo : ''}`}
          onClick={() => setTab('sugerencias')}
        >
          <span className={styles.tabIcono} aria-hidden="true">📮</span>
          Buzón de Sugerencias
        </button>
      </nav>

      {tab === 'reseñas' ? <MuroResenas /> : <Buzon />}
    </div>
  );
};

export default Comunidad;