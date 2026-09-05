import React, { useState, useCallback, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useToasts } from '../../context/ToastContext';
import {
  getResenasLibro,
  crearResena,
  toggleLikeResena,
  eliminarResena,
  mensajeError
} from '../../services/api';
import styles from './Resenas.module.css';

const PUBLICOS = {
  todo: 'Todo público',
  ninos: 'Ideal para niños',
  jovenes: 'Ideal para jóvenes',
  adultos_mayores: 'Ideal para adultos mayores'
};

const COLOR_ROL = {
  admin: '#d97706',
  bibliotecario: '#15803d',
  user: '#3d2314'
};

function formatearFecha(valor) {
  if (!valor) return '';
  const [fecha, hora] = String(valor).split(' ');
  if (!fecha) return '';
  const partes = fecha.split('-');
  if (partes.length !== 3) return fecha;
  return `${partes[2]}/${partes[1]}/${partes[0]}${hora ? ` · ${hora.slice(0, 5)}` : ''}`;
}

function iniciales(nombre) {
  return nombre
    ? nombre.split(' ').filter(Boolean).map((p) => p.charAt(0).toUpperCase()).slice(0, 2).join('')
    : '?';
}

export function Avatar({ nombre, rol }) {
  return (
    <span
      className={styles.avatar}
      style={{ background: COLOR_ROL[rol] || '#3d2314' }}
      aria-hidden="true"
    >
      {iniciales(nombre)}
    </span>
  );
}

export function VerEstrellas({ valor, size = 16 }) {
  const n = Math.round(Number(valor) || 0);
  return (
    <span className={styles.stars}>
      {[1, 2, 3, 4, 5].map((i) => (
        <svg
          key={i}
          width={size}
          height={size}
          viewBox="0 0 24 24"
          fill={i <= n ? 'currentColor' : 'none'}
          stroke="currentColor"
          strokeWidth="1.6"
          strokeLinecap="round"
          strokeLinejoin="round"
          className={styles.star}
        >
          <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>
        </svg>
      ))}
    </span>
  );
}

export function SelectorEstrellas({ valor, onChange, size = 26 }) {
  return (
    <div className={styles.selectorEstrellas} role="radiogroup" aria-label="Calificación con estrellas">
      {[1, 2, 3, 4, 5].map((i) => {
        const activa = i <= valor;
        return (
          <button
            key={i}
            type="button"
            className={`${styles.starBtn} ${activa ? styles.starBtnActiva : ''}`}
            onClick={() => onChange(i === valor ? 0 : i)}
            aria-label={`${i} ${i === 1 ? 'estrella' : 'estrellas'}`}
            aria-pressed={activa}
            title={`${i} ${i === 1 ? 'estrella' : 'estrellas'}`}
          >
            <svg
              width={size}
              height={size}
              viewBox="0 0 24 24"
              fill={activa ? 'currentColor' : 'none'}
              stroke="currentColor"
              strokeWidth="1.6"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>
            </svg>
          </button>
        );
      })}
      <span className={styles.selectorHint}>
        {valor === 0 ? 'Toca para calificar' : `${valor} de 5`}
      </span>
    </div>
  );
}

const Resenas = ({ libroId }) => {
  const { usuario } = useAuth();
  const toasts = useToasts();

  const [cargando, setCargando] = useState(true);
  const [resumen, setResumen] = useState({ total: 0, promedio: 0 });
  const [resenas, setResenas] = useState([]);

  const [estrellas, setEstrellas] = useState(0);
  const [comentario, setComentario] = useState('');
  const [publico, setPublico] = useState('todo');
  const [enviando, setEnviando] = useState(false);
  const [errorForm, setErrorForm] = useState('');
  const [agradecido, setAgradecido] = useState(false);

  const cargar = useCallback(async () => {
    if (!libroId) return;
    try {
      const response = await getResenasLibro(libroId);
      setResumen(response.data.resumen);
      setResenas(response.data.resenas);
    } catch (error) {
      toasts.error(mensajeError(error, 'No se pudieron cargar las reseñas'));
    } finally {
      setCargando(false);
    }
  }, [libroId, toasts]);

  useEffect(() => {
    setCargando(true);
    setResumen({ total: 0, promedio: 0 });
    setResenas([]);
    cargar();
  }, [cargar]);

  const publicar = async (e) => {
    e.preventDefault();
    setErrorForm('');

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
        libro_id: libroId,
        calificacion: estrellas,
        comentario: comentario.trim(),
        publico_recomendado: publico
      });
      setEstrellas(0);
      setComentario('');
      setPublico('todo');
      setAgradecido(true);
      setTimeout(() => setAgradecido(false), 5000);
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

  const borrarResena = async (resena) => {
    if (!window.confirm('¿Eliminar esta opinión?')) return;
    try {
      await eliminarResena(resena.id);
      toasts.exito('La opinión fue eliminada');
      cargar();
    } catch (error) {
      toasts.error(mensajeError(error));
    }
  };

  const puedeBorrar = (resena) =>
    usuario && (resena.usuario_id === usuario.id || ['admin', 'bibliotecario'].includes(usuario.rol));

  return (
    <section className={styles.seccion}>
      <div className={styles.cabecera}>
        <div>
          <h3 className={styles.titulo}>Reseñas y comentarios</h3>
          <p className={styles.subtitulo}>Opiniones de otros lectores como tú</p>
        </div>
        {!cargando && resumen.total > 0 && (
          <div className={styles.resumen}>
            <strong className={styles.resumenNum}>{Number(resumen.promedio).toFixed(1)}</strong>
            <VerEstrellas valor={resumen.promedio} />
            <span className={styles.resumenTotal}>
              {resumen.total} {resumen.total === 1 ? 'opinión' : 'opiniones'}
            </span>
          </div>
        )}
      </div>
      {usuario && (
        <form className={styles.forma} onSubmit={publicar}>
          {agradecido && (
            <div className={styles.banner} role="status">
              <span className={styles.bannerIcono}>💛</span>
              <div>
                <strong>¡Gracias por compartir tu opinión!</strong>
                <p>Tu reseña ya aparece en el muro de la comunidad.</p>
              </div>
            </div>
          )}
          {errorForm && <div className={styles.errorAlerta} role="alert">{errorForm}</div>}

          <div className={styles.campo}>
            <label className={styles.etiqueta}>¿Cuántas estrellas le das? *</label>
            <SelectorEstrellas valor={estrellas} onChange={setEstrellas} />
          </div>

          <div className={styles.campo}>
            <label className={styles.etiqueta} htmlFor={`resena-comentario-${libroId}`}>
              Tu opinión o reflexión sobre la lectura *
            </label>
            <textarea
              id={`resena-comentario-${libroId}`}
              className={styles.textarea}
              rows={4}
              maxLength={1500}
              value={comentario}
              onChange={(e) => setComentario(e.target.value)}
              placeholder="Cuéntale a la comunidad qué te pareció el libro, qué te hizo sentir..."
              required
            />
          </div>

          <div className={styles.campo}>
            <label className={styles.etiqueta} htmlFor={`resena-publico-${libroId}`}>
              Nivel de lectura / Recomendado para
            </label>
            <select
              id={`resena-publico-${libroId}`}
              className={styles.select}
              value={publico}
              onChange={(e) => setPublico(e.target.value)}
            >
              {Object.entries(PUBLICOS).map(([clave, etiqueta]) => (
                <option key={clave} value={clave}>{etiqueta}</option>
              ))}
            </select>
          </div>

          <div className={styles.acciones}>
            <button type="submit" className={styles.btnPublicar} disabled={enviando}>
              {enviando ? 'Publicando...' : 'Publicar mi opinión'}
            </button>
          </div>
        </form>
      )}

      <div className={styles.muro}>
        {cargando && <p className={styles.vacio}>Cargando opiniones...</p>}

        {!cargando && resenas.length === 0 && (
          <p className={styles.vacio}>
            Aún no hay opiniones sobre este libro. ¡Sé la primera persona en dejar la tuya!
          </p>
        )}

        {resenas.map((resena) => (
          <article key={resena.id} className={styles.tarjeta}>
            <div className={styles.filaUsuario}>
              <Avatar nombre={resena.nombre_usuario} rol={resena.rol_usuario} />
              <div className={styles.infoUsuario}>
                <strong>{resena.nombre_usuario}</strong>
                <span className={styles.fecha}>{formatearFecha(resena.fecha_creacion)}</span>
              </div>
              <div className={styles.infoDerecha}>
                <VerEstrellas valor={resena.calificacion} size={15} />
                <span className={styles.chipPublico}>{PUBLICOS[resena.publico_recomendado] || resena.publico_recomendado}</span>
              </div>
            </div>
            <p className={styles.comentario}>{resena.comentario}</p>
            <div className={styles.accionesTarjeta}>
              {resena.usuario_id !== (usuario && usuario.id) && (
                <button
                  type="button"
                  className={`${styles.btnLike} ${resena.yo_like ? styles.btnLikeActivo : ''}`}
                  onClick={() => alternarLike(resena)}
                  aria-pressed={!!resena.yo_like}
                  aria-label="Marcar esta opinión como útil"
                >
                  <svg width="15" height="15" viewBox="0 0 24 24" fill={resena.yo_like ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M14 9V5a3 3 0 0 0-3-3l-4 9v11h11.28a2 2 0 0 0 2-1.7l1.38-9a2 2 0 0 0-2-2.3zM7 22H4a2 2 0 0 1-2-2v-7a2 2 0 0 1 2-2h3"/>
                  </svg>
                  Útil <span className={styles.likeContador}>{resena.likes}</span>
                </button>
              )}
              {puedeBorrar(resena) && (
                <button
                  type="button"
                  className={styles.btnBorrar}
                  onClick={() => borrarResena(resena)}
                  aria-label="Eliminar esta opinión"
                >
                  Eliminar
                </button>
              )}
            </div>
          </article>
        ))}
      </div>
    </section>
  );
};

export default Resenas;