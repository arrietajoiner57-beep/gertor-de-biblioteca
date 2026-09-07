import React, { useState, useRef, useEffect } from 'react';
import { responder } from '../../services/asistente';
import { solicitarPrestamo, mensajeError } from '../../services/api';
import { useToasts } from '../../context/ToastContext';
import BookCover from '../BookCover/BookCover';
import styles from './AsistenteBiblioteca.module.css';

const SUGERENCIAS = [
  'Resumen de un libro',
  'Recomiéndame una lectura',
  'Horarios',
  'Libros de Ciencia Ficción'
];

const BIENVENIDA =
  '¡Hola! 👋 Soy tu Bibliotecario Virtual.\n\n' +
  'Puedo contarte resúmenes (hasta adaptados para los más pequeños), ' +
  'recomendarte lecturas según cómo te sientas, consultar la disponibilidad ' +
  'de un libro en tiempo real y ayudarte a solicitar préstamos desde aquí.\n\n' +
  'Elige una de las sugerencias o escribe tu pregunta.';

const AsistenteBiblioteca = () => {
  const [abierto, setAbierto] = useState(false);
  const [mensajes, setMensajes] = useState([
    { tipo: 'bot', texto: BIENVENIDA }
  ]);
  const [entrada, setEntrada] = useState('');
  const [pensando, setPensando] = useState(false);
  const [solicitando, setSolicitando] = useState(false);
  const cuerpoRef = useRef(null);
  const inputRef = useRef(null);
  const toasts = useToasts();

  useEffect(() => {
    if (abierto && inputRef.current) {
      setTimeout(() => inputRef.current.focus(), 250);
    }
  }, [abierto]);

  useEffect(() => {
    const cuerpo = cuerpoRef.current;
    if (cuerpo) {
      cuerpo.scrollTop = cuerpo.scrollHeight;
    }
  }, [mensajes, pensando, abierto]);

  const enviar = async (texto) => {
    const limpio = (texto || '').trim();
    if (!limpio || pensando) return;

    setMensajes((prev) => [...prev, { tipo: 'user', texto: limpio }]);
    setEntrada('');
    setPensando(true);

    try {
      const respuesta = await responder(limpio);
      setTimeout(() => {
        setMensajes((prev) => [
          ...prev,
          respuesta.tipo === 'libro'
            ? { tipo: 'bot_libro', texto: respuesta.texto, libro: respuesta.libro }
            : { tipo: 'bot', texto: respuesta.texto }
        ]);
        setPensando(false);
      }, 450);
    } catch (error) {
      setPensando(false);
      setMensajes((prev) => [
        ...prev,
        {
          tipo: 'bot',
          texto:
            'Disculpa, tuve un problema para consultar el catálogo. Asegúrate de que el servidor esté disponible e inténtalo de nuevo.'
        }
      ]);
    }
  };

  const manejarKey = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      enviar(entrada);
    }
  };

  const solicitar = async (libro) => {
    if (solicitando || libro._demo || !libro.id) return;
    if (Number(libro.cantidad_disponible) <= 0) {
      toasts.error('Este ejemplar está agotado por el momento.');
      return;
    }

    setSolicitando(true);
    try {
      await solicitarPrestamo({ libro_id: libro.id, cantidad: 1 });
      toasts.exito('Solicitud de préstamo enviada. Esperando aprobación.');
      setMensajes((prev) => [
        ...prev,
        {
          tipo: 'bot',
          texto: `¡Listo! 📖 Hemos enviado tu solicitud de préstamo para «${libro.titulo}».\n\nPuedes seguir su estado en la sección «Mis Préstamos».`
        }
      ]);
    } catch (error) {
      toasts.error(mensajeError(error));
    } finally {
      setSolicitando(false);
    }
  };

  const esEjemplo = (libro) => libro._demo || !libro.id;

  return (
    <>
      {/* ===== Botón flotante ===== */}
      <button
        type="button"
        className={`${styles.fab} ${abierto ? styles.fabAbierto : ''}`}
        onClick={() => setAbierto((v) => !v)}
        aria-label={abierto ? 'Cerrar bibliotecario virtual' : 'Abrir bibliotecario virtual'}
        aria-expanded={abierto}
      >
        <span className={styles.fabAnillo} />
        <span className={styles.fabLibro}>
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round">
            <path d="M12 6.5C10.4 4.9 8 4.5 5.5 4.5v13c2.5 0 4.9.4 6.5 2 1.6-1.6 4-2 6.5-2v-13c-2.5 0-4.9.4-6.5 2z" />
            <path d="M12 6.5v13" />
            <circle cx="12" cy="10.7" r="1.15" fill="currentColor" stroke="none" />
            <circle cx="12" cy="14.2" r="1.15" fill="currentColor" stroke="none" />
          </svg>
        </span>
        {!abierto && <span className={styles.fabEtiqueta}>¿Te ayudo?</span>}
        {!abierto && <span className={styles.fabPunto} />}
      </button>

      {/* ===== Ventana de chat ===== */}
      {abierto && (
        <section className={styles.ventana} aria-label="Chat del bibliotecario virtual" role="dialog" aria-modal="false">
          <header className={styles.cabecera}>
            <span className={styles.cabeceraAvatar}>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round">
                <path d="M12 6.5C10.4 4.9 8 4.5 5.5 4.5v13c2.5 0 4.9.4 6.5 2 1.6-1.6 4-2 6.5-2v-13c-2.5 0-4.9.4-6.5 2z" />
                <path d="M12 6.5v13" />
                <circle cx="12" cy="10.7" r="1.15" fill="currentColor" stroke="none" />
                <circle cx="12" cy="14.2" r="1.15" fill="currentColor" stroke="none" />
              </svg>
              <span className={styles.cabeceraPunto} />
            </span>
            <div className={styles.cabeceraTitulo}>
              <h3>Bibliotecario Virtual</h3>
              <p>¿En qué te puedo ayudar hoy?</p>
            </div>
            <button
              type="button"
              className={styles.cerrar}
              onClick={() => setAbierto(false)}
              aria-label="Cerrar chat"
            >
              &times;
            </button>
          </header>

          <div className={styles.cuerpo} ref={cuerpoRef}>
            {mensajes.map((m, i) => (
              <div key={i} className={`${styles.burbujaRow} ${m.tipo === 'user' ? styles.usuarioRow : ''}`}>
                {m.tipo !== 'user' && (
                  <span className={styles.miniAvatar}>
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M12 6.5C10.4 4.9 8 4.5 5.5 4.5v13c2.5 0 4.9.4 6.5 2 1.6-1.6 4-2 6.5-2v-13c-2.5 0-4.9.4-6.5 2z" />
                      <path d="M12 6.5v13" />
                    </svg>
                  </span>
                )}
                {m.tipo === 'bot_libro' ? (
                  <div className={styles.tarjetaLibro}>
                    <div className={styles.tarjetaTitulo}>
                      <div className={styles.tarjetaPortada}>
                        <BookCover portada={m.libro.portada} titulo={m.libro.titulo} size="sm" />
                      </div>
                      <div className={styles.tarjetaCabecera}>
                        <h4>{m.libro.titulo}</h4>
                        <p>{m.libro.autor}</p>
                        <div className={styles.tarjetaEtiquetas}>
                          {m.libro.genero && <span className={styles.tarjetaGenero}>{m.libro.genero}</span>}
                          {m.libro.rating ? <span className={styles.tarjetaRating}>★ {Number(m.libro.rating).toFixed(1)}</span> : null}
                        </div>
                        <span className={`${styles.estadoStock} ${Number(m.libro.cantidad_disponible) > 0 ? styles.estadoOk : styles.estadoNo}`}>
                          {Number(m.libro.cantidad_disponible) > 0
                            ? `Disponible · ${m.libro.cantidad_disponible} ej.`
                            : 'Agotado por el momento'}
                        </span>
                      </div>
                    </div>
                    <p className={styles.tarjetaTexto}>{m.texto}</p>
                    <button
                      type="button"
                      className={styles.botonPrestamo}
                      disabled={esEjemplo(m.libro) || Number(m.libro.cantidad_disponible) <= 0 || solicitando}
                      onClick={() => solicitar(m.libro)}
                      title={esEjemplo(m.libro) ? 'Título de ejemplo: solicítalo desde la sección «Libros»' : 'Solicitar este préstamo'}
                    >
                      {esEjemplo(m.libro)
                        ? 'Título de ejemplo'
                        : Number(m.libro.cantidad_disponible) <= 0
                          ? 'Agotado'
                          : solicitando
                            ? 'Enviando…'
                            : 'Solicitar préstamo'}
                    </button>
                  </div>
                ) : (
                  <div className={`${styles.burbuja} ${m.tipo === 'user' ? styles.usuario : ''}`}>
                    {m.texto}
                  </div>
                )}
              </div>
            ))}

            {pensando && (
              <div className={styles.burbujaRow}>
                <span className={styles.miniAvatar}>
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M12 6.5C10.4 4.9 8 4.5 5.5 4.5v13c2.5 0 4.9.4 6.5 2 1.6-1.6 4-2 6.5-2v-13c-2.5 0-4.9.4-6.5 2z" />
                    <path d="M12 6.5v13" />
                  </svg>
                </span>
                <div className={`${styles.burbuja} ${styles.burbujaPensando}`}>
                  <span className={styles.pensandoDot} />
                  <span className={styles.pensandoDot} />
                  <span className={styles.pensandoDot} />
                </div>
              </div>
            )}
          </div>

          <div className={styles.sugerencias}>
            {SUGERENCIAS.map((s) => (
              <button key={s} type="button" className={styles.chip} onClick={() => enviar(s)}>
                {s}
              </button>
            ))}
          </div>

          <div className={styles.barraEntrada}>
            <input
              ref={inputRef}
              type="text"
              value={entrada}
              onChange={(e) => setEntrada(e.target.value)}
              onKeyDown={manejarKey}
              placeholder="Escribe tu consulta sobre la biblioteca..."
              aria-label="Escribe tu consulta"
            />
            <button type="button" className={styles.enviar} onClick={() => enviar(entrada)} aria-label="Enviar consulta">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M22 2 11 13" />
                <path d="M22 2 15 22l-4-9-9-4 20-7z" />
              </svg>
            </button>
          </div>
        </section>
      )}
    </>
  );
};

export default AsistenteBiblioteca;