import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import BookCover from '../../components/BookCover/BookCover';
import Badge from '../../components/Badge/Badge';
import { getMisLibros, mensajeError } from '../../services/api';
import styles from './MisLecturas.module.css';

const formatFecha = (f) => {
  try {
    return new Date(f).toLocaleDateString('es-ES', { day: '2-digit', month: 'short', year: 'numeric' });
  } catch {
    return f;
  }
};

const diasRestantes = (fecha) => {
  if (!fecha) return null;
  const hoy = new Date();
  hoy.setHours(0, 0, 0, 0);
  const fin = new Date(fecha);
  fin.setHours(0, 0, 0, 0);
  return Math.round((fin - hoy) / 86400000);
};

const MisLecturas = () => {
  const [lectura, setLectura] = useState([]);
  const [viaSuscripcion, setViaSuscripcion] = useState(false);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    const fetch = async () => {
      try {
        setCargando(true);
        setError('');
        const response = await getMisLibros();
        setLectura(response.data.lectura || []);
        setViaSuscripcion(Boolean(response.data.via_suscripcion));
      } catch (err) {
        setError(mensajeError(err, 'No se pudieron cargar tus lecturas'));
      } finally {
        setCargando(false);
      }
    };
    fetch();
  }, []);

  const lecturasAccesibles = lectura.filter((l) => l.accesible);
  const lecturasHistorial = lectura.filter((l) => !l.accesible);

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <div>
          <h1 className={styles.title}>Mis Lecturas</h1>
          <p className={styles.subtitle}>Todos los libros que tienes en préstamo, listos para leer</p>
        </div>
        <button className={styles.btnCatalogo} onClick={() => navigate('/app/libros')}>
          Explorar catálogo
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M5 12h14M12 5l7 7-7 7"/>
          </svg>
        </button>
      </div>

      {viaSuscripcion && (
        <div className={styles.bannerSuscripcion}>
          <span className={styles.badgeSus}>✦</span>
          <div>
            <strong>Tu suscripción está activa</strong>
            <p>Puedes leer cualquier libro digital del catálogo sin necesidad de solicitarlo como préstamo.</p>
          </div>
        </div>
      )}

      {error && (
        <div className={styles.errorMsg}>
          <span>⚠️</span> {error}
        </div>
      )}

      {cargando ? (
        <div className={styles.cargando}>
          <span className={styles.spinner} />
          <p>Cargando tus lecturas...</p>
        </div>
      ) : lectura.length === 0 ? (
        <div className={styles.vacio}>
          <span className={styles.vacioIcono}>📚</span>
          <h3>Todavía no tienes libros en préstamo</h3>
          <p>Explora el catálogo, solicita un libro como préstamo y cuando lo tengas aparecerá aquí para leerlo.</p>
          <button className={styles.btnPrincipal} onClick={() => navigate('/app/libros')}>
            Ir al catálogo
          </button>
        </div>
      ) : (
        <>
          <div className={styles.grid}>
            {lecturasAccesibles.map((item) => {
              const activo = item.prestamos.find((pr) => pr.estado === 'activo');
              const dias = activo ? diasRestantes(activo.fecha_devolucion) : null;
              const pct = Math.min(100, Math.round(Number(item.progreso?.porcentaje_avance) || 0));
              return (
                <article key={item.libro.id} className={styles.tarjeta}>
                  <div className={styles.portadaWrap}>
                    <BookCover portada={item.libro.portada} titulo={item.libro.titulo} size="lg" />
                    {pct > 0 && (
                      <span className={styles.pctBurbuja}>{pct}%</span>
                    )}
                  </div>
                  <div className={styles.tarjetaBody}>
                    <h3 className={styles.tarjetaTitulo}>{item.libro.titulo}</h3>
                    <p className={styles.tarjetaAutor}>por {item.libro.autor}</p>
                    <div className={styles.tarjetaMeta}>
                      {item.via === 'suscripcion' ? (
                        <Badge tipo="suscripcion" />
                      ) : (
                        <Badge tipo="activo" />
                      )}
                      {activo && dias !== null && (
                        <span className={dias === 0 ? styles.fechaHoy : styles.fechaOk}>
                          {dias === 0 ? '¡Entrega hoy!' : `Entrega: ${formatFecha(activo.fecha_devolucion)}`}
                        </span>
                      )}
                    </div>
                    <div className={styles.barraWrap}>
                      <div className={styles.barraTrack}>
                        <div className={styles.barraFill} style={{ width: `${pct}%` }} />
                      </div>
                      <span className={styles.barraTexto}>
                        {pct === 0 ? 'Sin empezar' : pct >= 100 ? '¡Libro completo!' : `Llevas el ${pct}%`}
                      </span>
                    </div>
                    <button
                      className={styles.btnLeer}
                      onClick={() => navigate(`/app/lector/${item.libro.id}`)}
                    >
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"/><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"/>
                      </svg>
                      {pct > 0 && pct < 100 ? 'Continuar leyendo' : pct >= 100 ? 'Leer de nuevo' : 'Leer ahora'}
                    </button>
                  </div>
                </article>
              );
            })}
          </div>

          {lecturasHistorial.length > 0 && (
            <section className={styles.historial}>
              <h2 className={styles.historialTitulo}>Préstamos anteriores</h2>
              <div className={styles.historialLista}>
                {lecturasHistorial.map((item) => {
                  const ultimo = item.prestamos[item.prestamos.length - 1];
                  const pct = Math.min(100, Math.round(Number(item.progreso?.porcentaje_avance) || 0));
                  return (
                    <div key={item.libro.id} className={styles.historialFila}>
                      <BookCover portada={item.libro.portada} titulo={item.libro.titulo} size="sm" />
                      <div className={styles.historialInfo}>
                        <strong>{item.libro.titulo}</strong>
                        <small>
                          {ultimo?.estado === 'devuelto'
                            ? `Devuelto el ${formatFecha(ultimo.fecha_devolucion)}`
                            : `Préstamo ${ultimo?.estado || 'finalizado'}`}
                          {' · '}{pct > 0 ? `leíste el ${pct}%` : 'sin progreso'}
                        </small>
                      </div>
                      <Badge tipo={ultimo?.estado === 'devuelto' ? 'devuelto' : 'vencido'} />
                    </div>
                  );
                })}
              </div>
            </section>
          )}
        </>
      )}
    </div>
  );
};

export default MisLecturas;