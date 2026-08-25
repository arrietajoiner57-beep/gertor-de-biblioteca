import React, { useState, useEffect } from 'react';
import Table from '../../components/Table/Table';
import Modal from '../../components/Modal/Modal';
import Badge from '../../components/Badge/Badge';
import { useAuth } from '../../context/AuthContext';
import {
  getLibros,
  getLibro,
  createLibro,
  updateLibro,
  deleteLibro,
  solicitarPrestamo
} from '../../services/api';
import { mensajeError } from '../../services/api';
import styles from './Libros.module.css';

const LIBRO_VACIO = {
  titulo: '',
  autor: '',
  isbn: '',
  editorial: '',
  anio_publicacion: '',
  genero: '',
  cantidad_disponible: 1
};

const Libros = () => {
  const [libros, setLibros] = useState([]);
  const [busqueda, setBusqueda] = useState('');
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
  const { esAdmin } = useAuth();

  const columns = [
    { key: 'id', label: 'ID' },
    { key: 'titulo', label: 'Título' },
    { key: 'autor', label: 'Autor' },
    { key: 'isbn', label: 'ISBN' },
    { key: 'genero', label: 'Género' },
    { key: 'cantidad_disponible', label: 'Disponibles' },
    {
      key: 'estado',
      label: 'Estado',
      render: (row) => (
        <Badge tipo={row.cantidad_disponible > 0 ? 'disponible' : 'agotado'} />
      )
    }
  ];

  useEffect(() => {
    fetchLibros();
  }, []);

  const fetchLibros = async () => {
    try {
      const response = await getLibros();
      setLibros(response.data);
    } catch (error) {
      console.error('Error al obtener libros:', error);
    }
  };

  const librosFiltrados = libros.filter((l) => {
    const texto = busqueda.trim().toLowerCase();
    if (!texto) return true;
    return (
      (l.titulo || '').toLowerCase().includes(texto) ||
      (l.autor || '').toLowerCase().includes(texto) ||
      (l.genero || '').toLowerCase().includes(texto) ||
      (l.isbn || '').toLowerCase().includes(texto)
    );
  });

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
        cantidad_disponible: book.cantidad_disponible
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
      setDetalle(response.data);
      setDetalleAbierto(true);
    } catch (error) {
      alert(mensajeError(error));
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
      } else {
        await createLibro(formData);
      }
      fetchLibros();
      handleCloseModal();
    } catch (error) {
      setErrorModal(mensajeError(error));
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('¿Estás seguro de eliminar este libro? Esta acción no se puede deshacer.')) {
      return;
    }

    try {
      const response = await deleteLibro(id);
      alert(response.data.message);
      fetchLibros();
    } catch (error) {
      alert(mensajeError(error));
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

    try {
      await solicitarPrestamo({
        libro_id: libroSolicitar.id,
        cantidad: cantidadSolicitar
      });
      alert('Solicitud de préstamo enviada. Esperando aprobación del administrador.');
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
      <div className={styles.header}>
        <div>
          <h1 className={styles.title}>Libros</h1>
          <p className={styles.subtitle}>
            {esAdmin ? 'Catálogo de libros de la biblioteca' : 'Catálogo de libros disponibles'}
          </p>
        </div>
        {esAdmin && (
          <button className={styles.addBtn} onClick={() => handleOpenModal()}>
            + Nuevo Libro
          </button>
        )}
      </div>

      <input
        type="search"
        className={styles.buscador}
        placeholder="🔍 Buscar por título, autor, género o ISBN..."
        value={busqueda}
        onChange={(e) => setBusqueda(e.target.value)}
      />

      <Table
        columns={columns}
        data={librosFiltrados}
        onView={verDetalle}
        onEdit={esAdmin ? handleOpenModal : undefined}
        onDelete={esAdmin ? handleDelete : undefined}
        editLabel="Editar"
        showDeleteFor={(row) => row.cantidad_disponible >= 0}
        customActions={
          !esAdmin
            ? (row) =>
                row.cantidad_disponible > 0 ? (
                  <button
                    className={styles.solicitarBtn}
                    onClick={() => handleOpenSolicitar(row)}
                  >
                    Solicitar
                  </button>
                ) : null
            : undefined
        }
      />

      <Modal isOpen={detalleAbierto} onClose={() => setDetalleAbierto(false)} title="Detalle del Libro">
        {detalle && (
          <div className={styles.detalleGrid}>
            <p><strong>Título:</strong> {detalle.titulo}</p>
            <p><strong>Autor:</strong> {detalle.autor}</p>
            <p><strong>ISBN:</strong> {detalle.isbn}</p>
            <p><strong>Editorial:</strong> {detalle.editorial || '-'}</p>
            <p><strong>Año:</strong> {detalle.anio_publicacion || '-'}</p>
            <p><strong>Género:</strong> {detalle.genero || '-'}</p>
            <p>
              <strong>Estado:</strong>{' '}
              <Badge tipo={detalle.cantidad_disponible > 0 ? 'disponible' : 'agotado'} />
              {' '}({detalle.cantidad_disponible} ejemplares)
            </p>
          </div>
        )}
      </Modal>

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
            <input
              type="text"
              name="titulo"
              value={formData.titulo}
              onChange={handleChange}
              required
            />
          </div>
          <div className={styles.formGroup}>
            <label>Autor *</label>
            <input
              type="text"
              name="autor"
              value={formData.autor}
              onChange={handleChange}
              required
            />
          </div>
          <div className={styles.formGroup}>
            <label>ISBN *</label>
            <input
              type="text"
              name="isbn"
              value={formData.isbn}
              onChange={handleChange}
              required
            />
          </div>
          <div className={styles.formGroup}>
            <label>Editorial</label>
            <input
              type="text"
              name="editorial"
              value={formData.editorial}
              onChange={handleChange}
            />
          </div>
          <div className={styles.formRow}>
            <div className={styles.formGroup}>
              <label>Año Publicación</label>
              <input
                type="number"
                name="anio_publicacion"
                value={formData.anio_publicacion}
                onChange={handleChange}
              />
            </div>
            <div className={styles.formGroup}>
              <label>Cantidad Disponible *</label>
              <input
                type="number"
                name="cantidad_disponible"
                value={formData.cantidad_disponible}
                onChange={handleChange}
                min="0"
                required
              />
            </div>
          </div>
          <div className={styles.formGroup}>
            <label>Género</label>
            <input
              type="text"
              name="genero"
              value={formData.genero}
              onChange={handleChange}
            />
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
      <Modal
        isOpen={solicitarModal}
        onClose={handleCloseSolicitar}
        title="Solicitar Préstamo"
      >
        <form onSubmit={handleSolicitar}>
          {errorSolicitar && (
            <div className={styles.errorAlerta} role="alert">{errorSolicitar}</div>
          )}

          <div className={styles.detalleGrid}>
            <p><strong>Libro:</strong> {libroSolicitar ? libroSolicitar.titulo : ''}</p>
            <p><strong>Autor:</strong> {libroSolicitar ? libroSolicitar.autor : ''}</p>
            <p>
              <strong>Disponibles:</strong>{' '}
              {libroSolicitar ? libroSolicitar.cantidad_disponible : 0}
            </p>
          </div>

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

          <p style={{ fontSize: '0.85rem', color: '#666', marginTop: '-10px' }}>
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
    </div>
  );
};

export default Libros;
