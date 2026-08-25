import React, { useState, useEffect } from 'react';
import Table from '../../components/Table/Table';
import Modal from '../../components/Modal/Modal';
import Badge from '../../components/Badge/Badge';
import {
  getPrestamos,
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

const FILTROS = [
  { valor: '', etiqueta: 'Todos' },
  { valor: 'pendiente', etiqueta: 'Pendientes' },
  { valor: 'activo', etiqueta: 'Activos' },
  { valor: 'vencido', etiqueta: 'Vencidos' },
  { valor: 'devuelto', etiqueta: 'Devueltos' }
];

const Prestamos = () => {
  const [prestamos, setPrestamos] = useState([]);
  const [usuarios, setUsuarios] = useState([]);
  const [libros, setLibros] = useState([]);
  const [filtro, setFiltro] = useState('');
  const [modalAbierto, setModalAbierto] = useState(false);
  const [editarAbierto, setEditarAbierto] = useState(false);
  const [prestamoEditar, setPrestamoEditar] = useState(null);
  const [errorModal, setErrorModal] = useState('');
  const [formData, setFormData] = useState({
    usuario_id: '',
    fecha_prestamo: new Date().toISOString().split('T')[0],
    fecha_devolucion: '',
    libros: [{ libro_id: '', cantidad: 1 }]
  });
  const [fechasEdicion, setFechasEdicion] = useState({ fecha_prestamo: '', fecha_devolucion: '' });

  const columns = [
    { key: 'id', label: 'ID' },
    { key: 'nombre_usuario', label: 'Usuario' },
    { key: 'fecha_prestamo', label: 'Fecha Préstamo' },
    { key: 'fecha_devolucion', label: 'Fecha Límite' },
    { key: 'estado', label: 'Estado', render: (row) => <Badge tipo={row.estado} /> }
  ];

  useEffect(() => {
    fetchUsuarios();
    fetchLibros();
  }, []);

  useEffect(() => {
    fetchPrestamos(filtro);
  }, [filtro]);

  const fetchPrestamos = async (estado) => {
    try {
      const response = await getPrestamos(estado || undefined);
      setPrestamos(response.data);
    } catch (error) {
      console.error('Error al obtener préstamos:', error);
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
      fecha_prestamo: new Date().toISOString().split('T')[0],
      fecha_devolucion: '',
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
      fetchPrestamos(filtro);
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
      fetchPrestamos(filtro);
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
      alert(response.data.message);
      fetchPrestamos(filtro);
    } catch (error) {
      alert(mensajeError(error));
    }
  };

  const handleAprobar = async (id) => {
    if (!window.confirm('¿Aprobar esta solicitud de préstamo? Se descontará el stock disponible.')) {
      return;
    }

    try {
      const response = await aprobarPrestamo(id);
      alert(response.data.message);
      fetchPrestamos(filtro);
    } catch (error) {
      alert(mensajeError(error));
    }
  };

  const handleRechazar = async (id) => {
    if (!window.confirm('¿Rechazar esta solicitud de préstamo?')) {
      return;
    }

    try {
      const response = await rechazarPrestamo(id);
      alert(response.data.message);
      fetchPrestamos(filtro);
    } catch (error) {
      alert(mensajeError(error));
    }
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleFechaEdicionChange = (e) => {
    setFechasEdicion({ ...fechasEdicion, [e.target.name]: e.target.value });
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

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <div>
          <h1 className={styles.title}>Préstamos</h1>
          <p className={styles.subtitle}>Gestión de préstamos de libros</p>
        </div>
        <button className={styles.addBtn} onClick={handleOpenModal}>
          + Nuevo Préstamo
        </button>
      </div>

      <div className={styles.filtros}>
        {FILTROS.map((f) => (
          <button
            key={f.valor}
            className={`${styles.filtroBtn} ${filtro === f.valor ? styles.filtroActivo : ''}`}
            onClick={() => setFiltro(f.valor)}
          >
            {f.etiqueta}
          </button>
        ))}
      </div>

      <Table
        columns={columns}
        data={prestamos}
        onView={undefined}
        onEdit={(row) => handleOpenEditar(row)}
        onDelete={(id) => handleDevolver(id)}
        deleteLabel="Devolver"
        showDeleteFor={(row) => row.estado === 'activo' || row.estado === 'vencido'}
        customActions={(row) =>
          row.estado === 'pendiente' ? (
            <div className={styles.actionsGroup}>
              <button
                className={styles.btnAprobar}
                onClick={() => handleAprobar(row.id)}
              >
                Aprobar
              </button>
              <button
                className={styles.btnRechazar}
                onClick={() => handleRechazar(row.id)}
              >
                Rechazar
              </button>
            </div>
          ) : null
        }
      />

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
                required
              />
            </div>
          </div>

          <div className={styles.formActions}>
            <button type="button" className={styles.btnSecondary} onClick={handleCloseModals}>
              Cancelar
            </button>
            <button type="submit" className={styles.btnPrimary}>
              Guardar Cambios
            </button>
          </div>
        </form>
      </Modal>

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
                required
              />
            </div>
          </div>

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
            <button type="submit" className={styles.btnPrimary}>
              Crear Préstamo
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default Prestamos;
