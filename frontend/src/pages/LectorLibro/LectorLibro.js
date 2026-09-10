import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getLibro, getProgresoLectura, saveProgresoLectura, registrarTiempoLectura, getLibroLecturaUrl, getAccesoLectura, getTextoLibro, mensajeError } from '../../services/api';
import LectorToolbar from '../../components/LectorDigital/LectorToolbar';
import styles from './LectorLibro.module.css';

const TEMAS = {
  dia: { bg: '#ffffff', text: '#1a1a1a', name: 'Día' },
  sepia: { bg: '#F4ECD8', text: '#3d2314', name: 'Sepia' },
  noche: { bg: '#1A1A1A', text: '#d4c8b8', name: 'Noche' }
};

const IDIOMAS_LABEL = {
  es: 'Español',
  en: 'Inglés',
  fr: 'Francés',
  pt: 'Portugués',
  de: 'Alemán',
  it: 'Italiano',
  ru: 'Ruso'
};

const IDIOMAS_TTS = {
  es: 'es-ES',
  en: 'en-US',
  fr: 'fr-FR',
  pt: 'pt-BR',
  de: 'de-DE',
  it: 'it-IT',
  ru: 'ru-RU'
};

async function traducirTexto(texto, destino) {
  const url = `https://translate.googleapis.com/translate_a/single?client=gtx&dt=t&sl=auto&tl=${encodeURIComponent(destino)}&q=${encodeURIComponent(texto)}`;
  const resp = await fetch(url);
  if (!resp.ok) throw new Error('El servicio de traducción no respondió');
  const datos = await resp.json();
  return (datos[0] || []).map((seg) => seg[0]).join('');
}

const LectorLibro = () => {
  const { libroId } = useParams();
  const navigate = useNavigate();

  const [libro, setLibro] = useState(null);
  const [error, setError] = useState('');
  const [cargando, setCargando] = useState(true);
  const [sinAcceso, setSinAcceso] = useState(false);

  const [tema, setTema] = useState(() => localStorage.getItem('lector_tema') || 'dia');
  const [tamañoFuente, setTamañoFuente] = useState(() => parseInt(localStorage.getItem('lector_fontSize')) || 100);
  const [fuente, setFuente] = useState(() => localStorage.getItem('lector_font') || 'default');
  const [pantallaCompleta, setPantallaCompleta] = useState(false);
  const [ttsActivo, setTtsActivo] = useState(false);
  const [ttsLeyendo, setTtsLeyendo] = useState(false);

  const [progreso, setProgreso] = useState({ ultima_pagina: 1, porcentaje_avance: 0 });
  const [paginaActual, setPaginaActual] = useState(1);
  const [totalPaginas, setTotalPaginas] = useState(1);

  const [traduccionActiva, setTraduccionActiva] = useState(false);
  const [idiomaTraduccion, setIdiomaTraduccion] = useState(null);
  const [textoPagina, setTextoPagina] = useState('');
  const [textoTraducido, setTextoTraducido] = useState(null);
  const [traduciendo, setTraduciendo] = useState(false);
  const [errorTraduccion, setErrorTraduccion] = useState('');
const [verOriginal, setVerOriginal] = useState(false);
const [paginaIr, setPaginaIr] = useState('');
const traduccionCacheRef = useRef(new Map());

  const inicioLecturaRef = useRef(Date.now());
  const guardadoTimerRef = useRef(null);
  const iframeRef = useRef(null);
  const containerRef = useRef(null);

  useEffect(() => {
    localStorage.setItem('lector_tema', tema);
    localStorage.setItem('lector_fontSize', tamañoFuente);
    localStorage.setItem('lector_font', fuente);
  }, [tema, tamañoFuente, fuente]);

  useEffect(() => {
    const cargarDatos = async () => {
      setCargando(true);
      setError('');
      setSinAcceso(false);
      try {
        const [libroRes, progresoRes, accesoRes] = await Promise.all([
          getLibro(libroId),
          getProgresoLectura(libroId),
          getAccesoLectura(libroId)
        ]);
        if (!accesoRes.data.permitido) {
          setLibro(libroRes.data);
          setSinAcceso(true);
          setCargando(false);
          return;
        }
        setLibro(libroRes.data);
        setProgreso(progresoRes.data);
        setPaginaActual(progresoRes.data.ultima_pagina || 1);
      } catch (err) {
        setError(mensajeError(err, 'No se pudo cargar el libro'));
      } finally {
        setCargando(false);
      }
    };
    cargarDatos();
  }, [libroId]);

  useEffect(() => {
    return () => {
      const minutos = Math.floor((Date.now() - inicioLecturaRef.current) / 60000);
      if (minutos >= 1) {
        registrarTiempoLectura({ libro_id: parseInt(libroId), minutos });
      }
    };
  }, [libroId]);

  const manejarIdioma = useCallback((idioma) => {
    setVerOriginal(false);
    setErrorTraduccion('');
    if (!idioma) {
      setTraduccionActiva(false);
      setIdiomaTraduccion(null);
      setTextoTraducido(null);
      return;
    }
    setIdiomaTraduccion(idioma);
    setTraduccionActiva(true);
  }, []);

  useEffect(() => {
    if (!traduccionActiva || !idiomaTraduccion || sinAcceso || !libro) return;
    let activo = true;
    setTraduciendo(true);
    setErrorTraduccion('');
    setVerOriginal(false);

    const cargarTraduccion = async () => {
      try {
        const clave = `${libroId}:${idiomaTraduccion}:${paginaActual}`;
        let traducido = traduccionCacheRef.current.get(clave);
        if (!traducido) {
          const res = await getTextoLibro(libroId, paginaActual);
          if (!activo) return;
          setTextoPagina(res.data.texto || '');
          traducido = await traducirTexto(res.data.texto || '', idiomaTraduccion);
          traduccionCacheRef.current.set(clave, traducido);
        }
        if (activo) setTextoTraducido(traducido);
      } catch (err) {
        if (activo) setErrorTraduccion(mensajeError(err, 'No se pudo traducir esta página'));
      } finally {
        if (activo) setTraduciendo(false);
      }
    };
    cargarTraduccion();
    return () => { activo = false; };
  }, [traduccionActiva, idiomaTraduccion, paginaActual, libroId, libro, sinAcceso]);

  const guardarProgreso = useCallback(async (pag, total) => {
    if (guardadoTimerRef.current) clearTimeout(guardadoTimerRef.current);
    guardadoTimerRef.current = setTimeout(async () => {
      const porcentaje = total > 0 ? Math.round((pag / total) * 1000) / 10 : 0;
      const minutos = Math.floor((Date.now() - inicioLecturaRef.current) / 60000);
      try {
        await saveProgresoLectura(libroId, {
          ultima_pagina: pag,
          porcentaje_avance: porcentaje,
          total_paginas: total,
          minutos_leidos: minutos
        });
        inicioLecturaRef.current = Date.now();
      } catch (err) {
        // silent fail
      }
    }, 2000);
  }, [libroId]);

  const handlePageChange = useCallback((pag, total) => {
    setPaginaActual(pag);
    setTotalPaginas(total);
    guardarProgreso(pag, total);
  }, [guardarProgreso]);

  const cambiarPagina = useCallback((pag) => {
    if (!pag) return;
    const p = Math.max(1, Math.min(totalPaginas, parseInt(pag, 10) || 1));
    if (p !== paginaActual) handlePageChange(p, totalPaginas);
    setPaginaIr('');
  }, [totalPaginas, paginaActual, handlePageChange]);

  useEffect(() => {
    if (!traduccionActiva) return;
    const onKey = (e) => {
      if (e.key === 'ArrowRight' || e.key === 'PageDown') cambiarPagina(paginaActual + 1);
      if (e.key === 'ArrowLeft' || e.key === 'PageUp') cambiarPagina(paginaActual - 1);
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [traduccionActiva, cambiarPagina, paginaActual]);

  const toggleFullScreen = useCallback(() => {
    if (!document.fullscreenElement) {
      containerRef.current?.requestFullscreen?.();
      setPantallaCompleta(true);
    } else {
      document.exitFullscreen?.();
      setPantallaCompleta(false);
    }
  }, []);

  useEffect(() => {
    const onFsChange = () => setPantallaCompleta(!!document.fullscreenElement);
    document.addEventListener('fullscreenchange', onFsChange);
    return () => document.removeEventListener('fullscreenchange', onFsChange);
  }, []);

  const speakText = useCallback(() => {
    if (ttsLeyendo) {
      window.speechSynthesis?.cancel();
      setTtsLeyendo(false);
      setTtsActivo(false);
      return;
    }
    if (!window.speechSynthesis) return;
    setTtsActivo(true);
    const traducidoDisponible = traduccionActiva && idiomaTraduccion && textoTraducido;
    const texto = traducidoDisponible
      ? textoTraducido
      : libro
        ? `Estás leyendo ${libro.titulo}, de ${libro.autor || 'autor desconocido'}. Página ${paginaActual} de ${totalPaginas}.`
        : 'Lector en voz alta activado.';
    const utterance = new SpeechSynthesisUtterance(texto);
    utterance.lang = traducidoDisponible
      ? (IDIOMAS_TTS[idiomaTraduccion] || 'es-ES')
      : 'es-ES';
    utterance.rate = 0.95;
    utterance.pitch = 1;
    utterance.onend = () => {
      setTtsLeyendo(false);
      setTtsActivo(false);
    };
    utterance.onerror = () => {
      setTtsLeyendo(false);
      setTtsActivo(false);
    };
    window.speechSynthesis.speak(utterance);
    setTtsLeyendo(true);
  }, [ttsLeyendo, libro, paginaActual, totalPaginas, traduccionActiva, idiomaTraduccion, textoTraducido]);

  if (error) {
    return (
      <div className={styles.errorScreen}>
        <div className={styles.errorCard}>
          <span className={styles.errorIcono}>📖</span>
          <h2>No se puede abrir el lector</h2>
          <p>{error}</p>
          <button className={styles.btnVolver} onClick={() => navigate(-1)}>
            Volver
          </button>
        </div>
      </div>
    );
  }

  if (sinAcceso) {
    return (
      <div className={styles.errorScreen}>
        <div className={styles.errorCard}>
          <span className={styles.errorIcono}>🔒</span>
          <h2>Necesitas un préstamo para leer</h2>
          <p>
            «{libro?.titulo || 'Este libro'}» no está disponible todavía. Solicítalo como
            préstamo y, cuando esté activo, aparecerá en <strong>Mis Lecturas</strong> para que
            puedas leerlo.
          </p>
          <div className={styles.errorAcciones}>
            <button className={styles.btnVolver} onClick={() => navigate('/app/libros')}>
              Ir al catálogo
            </button>
            <button
              className={styles.btnSolicitar}
              onClick={() => navigate('/app/libros')}
            >
              Solicitar préstamo
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (cargando) {
    return (
      <div className={styles.loadingScreen}>
        <div className={styles.loadingSpinner} />
        <p>Preparando tu lectura...</p>
      </div>
    );
  }

  const temaActual = TEMAS[tema] || TEMAS.dia;
  const lecturaUrl = getLibroLecturaUrl(libroId);

  return (
    <div
      ref={containerRef}
      className={`${styles.lector} ${pantallaCompleta ? styles.fullscreen : ''}`}
      style={{
        backgroundColor: temaActual.bg,
        color: temaActual.text,
        fontFamily: fuente === 'opendyslexic'
          ? "'OpenDyslexic', sans-serif"
          : fuente === 'sans-serif'
            ? 'sans-serif'
            : 'inherit'
      }}
    >
      <LectorToolbar
        titulo={libro?.titulo || 'Lectura'}
        tema={tema}
        onTemaChange={setTema}
        tamañoFuente={tamañoFuente}
        onFontZoom={(dir) => setTamañoFuente((prev) => Math.max(60, Math.min(200, prev + dir * 10)))}
        onToggleFullScreen={toggleFullScreen}
        pantallaCompleta={pantallaCompleta}
        onVolver={() => navigate(-1)}
        ttsActivo={ttsActivo}
        ttsLeyendo={ttsLeyendo}
        onToggleTTS={speakText}
        onFontChange={setFuente}
        fuente={fuente}
        paginaActual={paginaActual}
        totalPaginas={totalPaginas}
        porcentaje={progreso.porcentaje_avance}
        traduccionActiva={traduccionActiva}
        idiomaTraduccion={idiomaTraduccion}
        onIdiomaChange={manejarIdioma}
      />

      <div className={styles.lectorArea}>
        {traduccionActiva ? (
          <div className={styles.paginaVirtual}>
            <div className={styles.paginaHoja}>
              <div className={styles.paginaCabecera}>
                <span className={styles.paginaTitulo}>{libro?.titulo}</span>
                <span className={styles.paginaSubtitulo}>
                  {libro?.autor}
                  {verOriginal
                    ? ' · Texto original'
                    : ` · Traducido al ${IDIOMAS_LABEL[idiomaTraduccion] || idiomaTraduccion}`}
                </span>
                <span className={styles.paginaRaya} />
              </div>

              {errorTraduccion && (
                <div className={styles.paginaError} role="alert">{errorTraduccion}</div>
              )}

              {traduciendo && !verOriginal && (
                <span className={styles.paginaCargando}>Traduciendo página {paginaActual}…</span>
              )}

              <div
                className={styles.paginaCuerpo}
                style={{ fontSize: `${Math.round(tamañoFuente * 0.14)}px` }}
              >
                {verOriginal
                  ? (textoPagina || 'Cargando texto original…')
                  : (textoTraducido || (traduciendo ? 'Preparando tu lectura en otro idioma…' : 'Cargando traducción…'))}
              </div>

              <div className={styles.paginaNav}>
                <button
                  type="button"
                  className={styles.paginaBtn}
                  onClick={() => cambiarPagina(paginaActual - 1)}
                  disabled={paginaActual <= 1}
                  title="Página anterior"
                >
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M15 18l-6-6 6-6"/></svg>
                </button>
                <span className={styles.paginaNavInfo}>Página {paginaActual} de {totalPaginas}</span>
                <button
                  type="button"
                  className={styles.paginaBtn}
                  onClick={() => cambiarPagina(paginaActual + 1)}
                  disabled={paginaActual >= totalPaginas}
                  title="Página siguiente"
                >
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9 6l6 6-6 6"/></svg>
                </button>
                <form
                  className={styles.paginaIr}
                  onSubmit={(e) => { e.preventDefault(); cambiarPagina(paginaIr); }}
                >
                  <input
                    value={paginaIr}
                    onChange={(e) => setPaginaIr(e.target.value)}
                    inputMode="numeric"
                    placeholder="Ir a página"
                    aria-label="Ir a página"
                  />
                  <button type="submit" title="Ir a la página indicada">Ir</button>
                </form>
              </div>

              <button
                type="button"
                className={styles.paginaAlternar}
                onClick={() => setVerOriginal((v) => !v)}
                title={verOriginal ? 'Ver versión traducida' : 'Ver texto original'}
              >
                {verOriginal ? 'Ver traducido' : 'Ver original'}
              </button>
            </div>
          </div>
        ) : (
        <>
          {libro?.formato === 'epub' ? (
          <iframe
            ref={iframeRef}
            src={`${lecturaUrl}#toolbar=0`}
            className={styles.readerFrame}
            title={`Lector: ${libro?.titulo}`}
            style={{ fontSize: `${tamañoFuente}%` }}
          />
        ) : (
          <iframe
            ref={iframeRef}
            src={`${lecturaUrl}#page=${paginaActual}&toolbar=0&zoom=page-width`}
            className={styles.readerFrame}
            title={`Lector: ${libro?.titulo}`}
            style={{ fontSize: `${tamañoFuente}%` }}
            onLoad={() => {
              try {
                const doc = iframeRef.current?.contentDocument;
                if (doc) {
                  doc.addEventListener('click', () => {
                    const pdfViewer = doc.querySelector('embed');
                    if (pdfViewer) {
                      const pageInfo = pdfViewer.getAttribute('data-page-number');
                      if (pageInfo) handlePageChange(parseInt(pageInfo), totalPaginas);
                    }
                  });
                }
              } catch (e) {
                // cross-origin - normal with internal PDF viewer
              }
            }}
          />
          )}
        </>
        )}
      </div>
    </div>
  );
};

export default LectorLibro;