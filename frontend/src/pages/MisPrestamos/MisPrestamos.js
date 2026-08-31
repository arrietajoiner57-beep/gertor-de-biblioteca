import React, { useState, useEffect } from 'react';
import Badge from '../../components/Badge/Badge';
import { getMisPrestamos, mensajeError } from '../../services/api';
import styles from './MisPrestamos.module.css';

const FILTROS = [
  { valor: '', etiqueta: 'Todos', icono: '✨' },
  { valor: 'pendiente', etiqueta: 'Pendientes', icono: '🕐' },
  { valor: 'activo', etiqueta: 'Activos', icono: '📖' },
  { valor: 'vencido', etiqueta: 'Vencidos', icono: '⏰' },
  { valor: 'devuelto', etiqueta: 'Devueltos', icono: '✅' }
];

const ESTADO_ICONO = {
  pendiente: '🕐',
  activo: '📖',
  vencido: '⏰',
  devuelto: '✅'
};

const VARIANTE_ESTADO = {
  pendiente: 'dorado',
  activo: 'azul',
  vencido: 'rojo',
  devuelto: 'esmeralda'
};

const diasRestantes = (fecha) => {
  if (!fecha) return null;
  const hoy = new Date();
  hoy.setHours(0, 0, 0, 0);
  const fin = new Date(fecha);
  fin.setHours(0, 0, 0, 0);
  return Math.round((fin - hoy) / 86400000);
};

const formatFecha = (f) => {
  try {
    return new Date(f).toLocaleDateString('es-ES', {
      day: '2-digit',
      month: 'short',
      year: 'numeric'
    });
  } catch {
    return f;
  }
};

const MisPrestamos = () => {
  const [todos, setTodos] = useState([]);
  const [filtro, setFiltro] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    fetchPrestamos();
  }, []);

  useEffect(() => {
    fetchPrestamos(filtro);
  }, [filtro]);

  const fetchPrestamos = async (estado) => {
    try {
      setError('');
      const response = await getMisPrestamos(estado || undefined);
      setTodos(response.data);
    } catch (err) {
      setError(mensajeError(err, 'No se pudieron cargar tus préstamos'));
    }
  };

  const conteos = {
    total: todos.length,
    pendiente: todos.filter((p) => p.estado === 'pendiente').length,
    activo: todos.filter((p) => p.estado === 'activo').length,
    vencido: todos.filter((p) => p.estado === 'vencido').length,
    devuelto: todos.filter((p) => p.estado === 'devuelto').length
  };

  const visible = filtro === '' ? todos : todos.filter((p) => p.estado === filtro);

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <div>
          <h1 className={styles.title}>Mis Préstamos</h1>
          <p className={styles.subtitle}>Historial y estado de tus préstamos</p>
        </div>
      </div>

      {/* ===== Resumen ===== */}
      <div className={styles.resumen}>
        {FILTROS.map((f) => (
          <button
            key={f.valor}
            className={`${styles.resumenItem} ${filtro === f.valor ? styles.resumenActivo : ''}`}
            onClick={() => setFiltro(f.valor)}
          >
            <span className={styles.resumenIcono}>{f.icono}</span>
            <span className={styles.resumenNumero}>
              {conteos[f.valor || 'total']}
            </span>
            <span className={styles.resumenEtiqueta}>{f.etiqueta}</span>
          </button>
        ))}
      </div>

      {/* ===== Panel lector ===== */}
      {error && (
        <div className={styles.errorMsg}>
          <span>⚠️</span> {error}
        </div>
      )}

      {!error && visible.length === 0 && (
        <div className={styles.vacio}>
          <span className={styles.vacioIcono}>📚</span>
          <p>{filtro === '' ? 'Todavía no tienes préstamos' : `No tienes préstamos ${filtro}s`}</p>
          <small>Explora el catálogo y solicita tu próximo libro</small>
        </div>
      )}

      <div className={styles.lista}>
        {visible.map((p) => {
          const dias = diasRestantes(p.fecha_devolucion);
          const esVencido = p.estado === 'vencido';
          const variante = VARIANTE_ESTADO[p.estado] || 'neutral';
          return (
            <article key={p.id} className={`${styles.tarjeta} ${styles['tarjeta_' + variante]}`}>
              <div className={`${styles.anillo} ${styles['anillo_' + variante]}`}>
                <span className={styles.anilloIcono}>{ESTADO_ICONO[p.estado]}</span>
                <span className={styles.anilloNum}>#{p.id}</span>
              </div>

              <div className={styles.cuerpo}>
                <div className={styles.cuerpoTop}>
                  <Badge tipo={p.estado} />
                  <span className={styles.fechaLimite}>
                    {esVencido ? (
                      <strong className={styles.vencidoTexto}>
                        Vencido hace {Math.abs(dias)} día{Math.abs(dias) === 1 ? '' : 's'}
                      </strong>
                    ) : p.estado === 'activo' ? (
                      <span className={styles.countdown}>
                        {dias === 0 ? '¡Entrega hoy!' : `Entrega en ${dias} día${dias === 1 ? '' : 's'}`}
                      </span>
                    ) : null}
                  </span>
                </div>

                <div className={styles.libros}>
                  {(p.detalles || []).map((d, i) => (
                    <div key={i} className={styles.libroRow}>
                      <span className={styles.libroIcono}>📖</span>
                      <div className={styles.libroInfo}>
                        <strong>{d.titulo_libro}</strong>
                        <small>Autor: {d.autor || '-'}</small>
                      </div>
                      <span className={styles.libroCantidad}>x{d.cantidad}</span>
                    </div>
                  ))}
                  {(!p.detalles || p.detalles.length === 0) && (
                    <div className={styles.sinDetalles}>Libros no disponibles</div>
                  )}
                </div>

                <div className={styles.fechas}>
                  <span>
                    <small>Fecha de préstamo</small>
                    {formatFecha(p.fecha_prestamo)}
                  </span>
                  <span className={esVencido ? styles.fechaVencida : ''}>
                    <small>{esVencido ? 'Fecha límite (superada)' : 'Fecha límite'}</small>
                    {formatFecha(p.fecha_devolucion)}
                  </span>
                  {p.estado === 'devuelto' && (
                    <span>
                      <small>Estado</small>
                      Completado ✅
                    </span>
                  )}
                </div>
              </div>
            </article>
          );
        })}
      </div>
    </div>
  );
};

export default MisPrestamos;