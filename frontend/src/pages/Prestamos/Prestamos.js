import React, { useState, useEffect } from 'react';
import Modal from '../../components/Modal/Modal';
import Badge from '../../components/Badge/Badge';
import ExportButtons from '../../components/ExportButtons/ExportButtons';
import { useToasts } from '../../context/ToastContext';
import {
  getPrestamos,
  getPrestamo,
  getUsuarios,
  getLibros,
  createPrestamo,
  updatePrestamo,
  devolverPrestamo,
  aprobarPrestamo,
  rechazarPrestamo,
  mensajeError
} from '../../services/api';
import styles from './Prestamos.module.css';

const COLUMNAS = [
  {
    estado: 'pendiente',
    titulo: 'Solicitudes pendientes',
    icono: '🕐',
    dot: 'var(--color-gold)'
  },
  {
    estado: 'activo',
    titulo: 'Préstamos activos',
    icono: '📖',
    dot: 'var(--color-blue)'
  },
  {
    estado: 'vencido',
    titulo: 'Vencidos',
    icono: '⏰',
    dot: 'var(--color-red)'
  },
  {
    estado: 'devuelto',
    titulo: 'Devueltos',
    icono: '✅',
    dot: 'var(--color-emerald)'
  }
];

const variaAntesDe = (fecha) => {
  if (!fecha) return null;
  const hoy = new Date();
  hoy.setHours(0, 0, 0, 0);
  const fin = new Date(fecha);
  fin.setHours(0, 0, 0, 0);
  return Math.round((fin - hoy) / 86400000);
};

/* ===== Validación estricta de fechas de préstamo ===== */
const DIAS_SUGERIDOS = 14;

const aISO = (fecha) =>
  `${fecha.getFullYear()}-${String(fecha.getMonth() + 1).padStart(2, '0')}-${String(fecha.getDate()).padStart(2, '0')}`;

const HOY = aISO(new Date());

const sumarDias = (fechaISO, n) => {
  const [y, m, d] = fechaISO.split('-').map(Number);
  return aISO(new Date(y, m - 1, d + n));
};

const validarFechasNuevo = (data) => {
  const errores = [];
  const { fecha_prestamo, fecha_devolucion } = data;

  if (fecha_prestamo && fecha_prestamo < HOY) {
    errores.push('La fecha de préstamo no puede ser anterior al día de hoy.');
  }
  if (fecha_devolucion && fecha_devolucion < HOY) {
    errores.push('La fecha de devolución no puede ser anterior al día de hoy.');
  }
  if (fecha_prestamo && fecha_devolucion && fecha_devolucion < fecha_prestamo) {
    errores.push('La fecha de devolución debe ser igual o posterior a la fecha de préstamo.');
  }

  return errores;
};

const validarFechasEdicion = (fechas, originales) => {
  const errores = [];
  const { fecha_prestamo, fecha_devolucion } = fechas;
  const cambioPrestamo = fecha_prestamo !== originales.fecha_prestamo;
  const cambioDevolucion = fecha_devolucion !== originales.fecha_devolucion;

  if (cambioPrestamo && fecha_prestamo && fecha_prestamo < HOY) {
    errores.push('La fecha de préstamo no puede ser anterior al día de hoy.');
  }
  if (cambioDevolucion && fecha_devolucion && fecha_devolucion < HOY) {
    errores.push('La fecha de devolución no puede ser anterior al día de hoy.');
  }
  if (fecha_prestamo && fecha_devolucion && fecha_devolucion < fecha_prestamo) {
    errores.push('La fecha de devolución debe ser igual o posterior a la fecha de préstamo.');
  }

  return errores;
};

const Prestamos = () => {
  const [prestamos, setPrestamos] = useState([]);
  const [usuarios, setUsuarios] = useState([]);
  const [libros, setLibros] = useState([]);
  const [modalAbierto, setModalAbierto] = useState(false);
  const [editarAbierto, setEditarAbierto] = useState(false);
  const [prestamoEditar, setPrestamoEditar] = useState(null);
  const [errorModal, setErrorModal] = useState('');
  const [cargando, setCargando] = useState(true);
  const [formData, setFormData] = useState({
    usuario_id: '',
    fecha_prestamo: HOY,
    fecha_devolucion: sumarDias(HOY, DIAS_SUGERIDOS),
    libros: [{ libro_id: '', cantidad: 1 }]
  });
  const [fechasEdicion, setFechasEdicion] = useState({ fecha_prestamo: '', fecha_devolucion: '' });
  const [fechasOriginales, setFechasOriginales] = useState({ fecha_prestamo: '', fecha_devolucion: '' });
  const toasts = useToasts();

  useEffect(() => {
    fetchUsuarios();
    fetchLibros();
  }, []);

  useEffect(() => {
    fetchPrestamos();
  }, []);

  const fetchPrestamos = async () => {
    try {
      setCargando(true);
      const response = await getPrestamos();
      const conDetalles = await Promise.all(
        response.data.map((p) =>
          getPrestamo(p.id)
            .then((r) => ({ ...p, detalles: r.data.detalles || [] }))
            .catch(() => ({ ...p, detalles: [] }))
        )
      );
      setPrestamos(conDetalles);
    } catch (error) {
      console.error('Error al obtener préstamos:', error);
    } finally {
      setCargando(false);
    }
  };

  const fetchUsuarios = async () => {
    try {
      const response = await getUsuarios();
      setUsuarios(response.data);
    } catch (error) {
      console.error('Error al obtener usuarios:', error);
    }
  };

  const fetchLibros = async () => {
    try {
      const response = await getLibros();
      setLibros(response.data);
    } catch (error) {
      console.error('Error al obtener libros:', error);
    }
  };

  const handleOpenModal = () => {
    setErrorModal('');
    setFormData({
      usuario_id: '',
      fecha_prestamo: HOY,
      fecha_devolucion: sumarDias(HOY, DIAS_SUGERIDOS),
      libros: [{ libro_id: '', cantidad: 1 }]
    });
    setModalAbierto(true);
  };

  const handleOpenEditar = (prestamo) => {
    setErrorModal('');
    setPrestamoEditar(prestamo);
    setFechasEdicion({
      fecha_prestamo: prestamo.fecha_prestamo,
      fecha_devolucion: prestamo.fecha_devolucion
    });
    setFechasOriginales({
      fecha_prestamo: prestamo.fecha_prestamo,
      fecha_devolucion: prestamo.fecha_devolucion
    });
    setEditarAbierto(true);
  };

  const handleCloseModals = () => {
    setModalAbierto(false);
    setEditarAbierto(false);
    setPrestamoEditar(null);
    setErrorModal('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorModal('');

    try {
      await createPrestamo(formData);
      toasts.exito('Préstamo creado correctamente');
      fetchPrestamos();
      handleCloseModals();
    } catch (error) {
      setErrorModal(mensajeError(error));
    }
  };

  const handleGuardarEdicion = async (e) => {
    e.preventDefault();
    setErrorModal('');

    try {
      await updatePrestamo(prestamoEditar.id, fechasEdicion);
      toasts.exito('Fechas actualizadas correctamente');
      fetchPrestamos();
      handleCloseModals();
    } catch (error) {
      setErrorModal(mensajeError(error));
    }
  };

  const handleDevolver = async (id) => {
    if (!window.confirm('¿Confirmar devolución de estos libros?')) {
      return;
    }

    try {
      const response = await devolverPrestamo(id);
      toasts.exito(response.data.message);
      fetchPrestamos();
    } catch (error) {
      toasts.error(mensajeError(error));
    }
  };

  const handleAprobar = async (id) => {
    if (!window.confirm('¿Aprobar esta solicitud de préstamo? Se descontará el stock disponible.')) {
      return;
    }

    try {
      const response = await aprobarPrestamo(id);
      toasts.exito(response.data.message);
      fetchPrestamos();
    } catch (error) {
      toasts.error(mensajeError(error));
    }
  };

  const handleRechazar = async (id) => {
    if (!window.confirm('¿Rechazar esta solicitud de préstamo?')) {
      return;
    }

    try {
      const response = await rechazarPrestamo(id);
      toasts.exito(response.data.message);
      fetchPrestamos();
    } catch (error) {
      toasts.error(mensajeError(error));
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;

    if (name === 'fecha_prestamo') {
      setFormData((prev) => {
        const siguiente = { ...prev, fecha_prestamo: value };
        if (!siguiente.fecha_devolucion || siguiente.fecha_devolucion < value) {
          siguiente.fecha_devolucion = sumarDias(value, DIAS_SUGERIDOS);
        }
        return siguiente;
      });
      return;
    }

    setFormData({ ...formData, [name]: value });
  };

  const handleFechaEdicionChange = (e) => {
    const { name, value } = e.target;

    if (name === 'fecha_prestamo') {
      setFechasEdicion((prev) => {
        const siguiente = { ...prev, fecha_prestamo: value };
        if (!siguiente.fecha_devolucion || siguiente.fecha_devolucion < value) {
          siguiente.fecha_devolucion = sumarDias(value, DIAS_SUGERIDOS);
        }
        return siguiente;
      });
      return;
    }

    setFechasEdicion({ ...fechasEdicion, [name]: value });
  };

  const handleAddLibro = () => {
    setFormData({
      ...formData,
      libros: [...formData.libros, { libro_id: '', cantidad: 1 }]
    });
  };

  const handleRemoveLibro = (index) => {
    const newLibros = formData.libros.filter((_, i) => i !== index);
    setFormData({ ...formData, libros: newLibros });
  };

  const handleLibroChange = (index, field, value) => {
    const newLibros = [...formData.libros];
    newLibros[index] = {
      ...newLibros[index],
      [field]: field === 'cantidad' ? parseInt(value) || 1 : value
    };
    setFormData({ ...formData, libros: newLibros });
  };

  const inicial = (nombre) => (nombre || '?').charAt(0).toUpperCase();

  const erroresFechasNuevo = validarFechasNuevo(formData);
  const erroresFechasEdicion = validarFechasEdicion(fechasEdicion, fechasOriginales);

  return (
    <div className={styles.container}>
      {/* ===== Header ===== */}
      <div className={styles.header}>
        <div>
          <h1 className={styles.title}>Préstamos</h1>
          <p className={styles.subtitle}>Gestión de préstamos de libros</p>
        </div>
        <div className={styles.headerAcciones}>
          <ExportButtons seccion="prestamos" />
          <button className={styles.addBtn} onClick={handleOpenModal}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>
            </svg>
            Nuevo Préstamo
          </button>
        </div>
      </div>

      {/* ===== Pipeline resumen ===== */}
      <div className={styles.pipeline}>
        {COLUMNAS.map((c) => {
          const total = prestamos.filter((p) => p.estado === c.estado).length;
          const resaltado = c.estado === 'vencido' && total > 0;
          return (
            <div key={c.estado} className={`${styles.pipelineItem} ${resaltado ? styles.pipelinePeligro : ''}`}>
              <span className={styles.pipelineIcono}>{c.icono}</span>
              <div>
                <span className={styles.pipelineNumero}>{total}</span>
                <span className={styles.pipelineEtiqueta}>{c.titulo}</span>
              </div>
            </div>
          );
        })}
      </div>

      {/* ===== Kanban ===== */}
      <div className={styles.tablero}>
        {COLUMNAS.map((c) => {
          const tarjetas = prestamos.filter((p) => p.estado === c.estado);
          return (
            <section key={c.estado} className={styles.columna}>
              <header className={styles.columnaHeader}>
                <span className={styles.columnaDot} style={{ background: c.dot, boxShadow: `0 0 10px ${c.dot}` }} />
                <h3>{c.icono} {c.titulo}</h3>
                <span className={styles.columnaCount}>{tarjetas.length}</span>
              </header>

              <div className={styles.columnaBody}>
                {tarjetas.length === 0 && (
                  <div className={styles.columnaVacia}>Sin tarjetas</div>
                )}

                {tarjetas.map((p) => {
                  const dias = variaAntesDe(p.fecha_devolucion);
                  const esVencido = p.estado === 'vencido';
                  return (
                    <article key={p.id} className={`${styles.tarjeta} ${esVencido ? styles.tarjetaVencida : ''}`}>
                      <div className={styles.tarjetaTop}>
                        <span className={styles.tarjetaAvatar}>
                          {inicial(p.nombre_usuario)}
                        </span>
                        <div className={styles.tarjetaUsuario}>
                          <h4>{p.nombre_usuario}</h4>
                          <span className={styles.tarjetaId}>Préstamo #{p.id}</span>
                        </div>
                        <Badge tipo={p.estado} />
                      </div>

                      {(p.detalles || []).length > 0 && (
                        <div className={styles.tarjetaLibros}>
                          {p.detalles.map((d, i) => (
                            <span key={i} className={styles.libroChip}>
                              📖 {d.titulo_libro}
                              <b>x{d.cantidad}</b>
                            </span>
                          ))}
                        </div>
                      )}

                      <div className={styles.tarjetaFechas}>
                        <span>
                          <small>Inicio</small>
                          {p.fecha_prestamo}
                        </span>
                        <span className={esVencido ? styles.fechaVencida : ''}>
                          <small>{esVencido ? 'Vencida' : 'Entrega'}</small>
                          {p.fecha_devolucion}
                          {dias !== null && p.estado === 'activo' && (
                            <em className={styles.diasRestantes}>
                              {dias === 0 ? 'hoy' : dias < 0 ? `${Math.abs(dias)}d de retraso` : `en ${dias}d`}
                            </em>
                          )}
                        </span>
                      </div>

                      <div className={styles.tarjetaAcciones}>
                        {p.estado === 'pendiente' && (
                          <>
                            <button className={`${styles.accBtn} ${styles.accAprobar}`} onClick={() => handleAprobar(p.id)}>
                              ✓ Aprobar
                            </button>
                            <button className={`${styles.accBtn} ${styles.accRechazar}`} onClick={() => handleRechazar(p.id)}>
                              ✕ Rechazar
                            </button>
                          </>
                        )}
                        {(p.estado === 'activo' || p.estado === 'vencido') && (
                          <>
                            <button className={`${styles.accBtn} ${styles.accDevolver}`} onClick={() => handleDevolver(p.id)}>
                              ↺ Devolver
                            </button>
                            <button className={`${styles.accBtn} ${styles.accEditar}`} onClick={() => handleOpenEditar(p)}>
                              ✎ Fechas
                            </button>
                          </>
                        )}
                        {p.estado === 'devuelto' && (
                          <span className={styles.devueltoNota}>Completado</span>
                        )}
                      </div>
                    </article>
                  );
                })}
              </div>
            </section>
          );
        })}
      </div>

      {cargando && <div className={styles.cargando}>Cargando préstamos...</div>}

      {/* ===== Modal editar fechas ===== */}
      <Modal isOpen={editarAbierto} onClose={handleCloseModals} title={`Editar Préstamo #${prestamoEditar ? prestamoEditar.id : ''}`}>
        <form onSubmit={handleGuardarEdicion}>
          {errorModal && <div className={styles.errorAlerta} role="alert">{errorModal}</div>}

          <div className={styles.formGroup}>
            <label>Usuario</label>
            <input type="text" value={prestamoEditar ? prestamoEditar.nombre_usuario : ''} disabled />
          </div>

          <div className={styles.formRow}>
            <div className={styles.formGroup}>
              <label>Fecha Préstamo *</label>
              <input
                type="date"
                name="fecha_prestamo"
                value={fechasEdicion.fecha_prestamo}
                onChange={handleFechaEdicionChange}
                min={HOY}
                required
              />
            </div>
            <div className={styles.formGroup}>
              <label>Fecha Devolución *</label>
              <input
                type="date"
                name="fecha_devolucion"
                value={fechasEdicion.fecha_devolucion}
                onChange={handleFechaEdicionChange}
                min={HOY}
                required
              />
            </div>
          </div>

          {erroresFechasEdicion.length > 0 && (
            <div className={styles.erroresFechas} role="alert">
              {erroresFechasEdicion.map((msg) => (
                <p key={msg}>
                  <span className={styles.errorIcono}>⚠️</span> {msg}
                </p>
              ))}
            </div>
          )}

          <div className={styles.formActions}>
            <button type="button" className={styles.btnSecondary} onClick={handleCloseModals}>
              Cancelar
            </button>
            <button type="submit" className={styles.btnPrimary} disabled={erroresFechasEdicion.length > 0}>
              Guardar Cambios
            </button>
          </div>
        </form>
      </Modal>

      {/* ===== Modal nuevo préstamo ===== */}
      <Modal isOpen={modalAbierto} onClose={handleCloseModals} title="Nuevo Préstamo">
        <form onSubmit={handleSubmit}>
          {errorModal && <div className={styles.errorAlerta} role="alert">{errorModal}</div>}

          <div className={styles.formGroup}>
            <label>Usuario *</label>
            <select
              name="usuario_id"
              value={formData.usuario_id}
              onChange={handleChange}
              required
            >
              <option value="">Seleccionar usuario</option>
              {usuarios.map((user) => (
                <option key={user.id} value={user.id}>
                  {user.nombre}
                </option>
              ))}
            </select>
          </div>

          <div className={styles.formRow}>
            <div className={styles.formGroup}>
              <label>Fecha Préstamo *</label>
              <input
                type="date"
                name="fecha_prestamo"
                value={formData.fecha_prestamo}
                onChange={handleChange}
                min={HOY}
                required
              />
            </div>
            <div className={styles.formGroup}>
              <label>Fecha Devolución *</label>
              <input
                type="date"
                name="fecha_devolucion"
                value={formData.fecha_devolucion}
                onChange={handleChange}
                min={HOY}
                required
              />
            </div>
          </div>

          {erroresFechasNuevo.length > 0 && (
            <div className={styles.erroresFechas} role="alert">
              {erroresFechasNuevo.map((msg) => (
                <p key={msg}>
                  <span className={styles.errorIcono}>⚠️</span> {msg}
                </p>
              ))}
            </div>
          )}

          <div className={styles.librosSection}>
            <div className={styles.librosHeader}>
              <h3>Libros a prestar</h3>
              <button type="button" className={styles.addLibroBtn} onClick={handleAddLibro}>
                + Agregar Libro
              </button>
            </div>

            {formData.libros.map((libro, index) => (
              <div key={index} className={styles.libroRow}>
                <select
                  value={libro.libro_id}
                  onChange={(e) => handleLibroChange(index, 'libro_id', e.target.value)}
                  required
                >
                  <option value="">Seleccionar libro</option>
                  {libros.map((l) => (
                    <option key={l.id} value={l.id} disabled={l.cantidad_disponible === 0}>
                      {l.titulo} (Disp: {l.cantidad_disponible}){l.cantidad_disponible === 0 ? ' - Agotado' : ''}
                    </option>
                  ))}
                </select>
                <input
                  type="number"
                  value={libro.cantidad}
                  onChange={(e) => handleLibroChange(index, 'cantidad', e.target.value)}
                  min="1"
                  required
                />
                {formData.libros.length > 1 && (
                  <button
                    type="button"
                    className={styles.removeLibroBtn}
                    onClick={() => handleRemoveLibro(index)}
                  >
                    &times;
                  </button>
                )}
              </div>
            ))}
          </div>

          <div className={styles.formActions}>
            <button type="button" className={styles.btnSecondary} onClick={handleCloseModals}>
              Cancelar
            </button>
            <button type="submit" className={styles.btnPrimary} disabled={erroresFechasNuevo.length > 0}>
              Crear Préstamo
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default Prestamos;