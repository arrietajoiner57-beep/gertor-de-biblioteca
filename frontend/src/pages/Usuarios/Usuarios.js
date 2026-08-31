import React, { useState, useEffect } from 'react';
import Table from '../../components/Table/Table';
import Modal from '../../components/Modal/Modal';
import Badge from '../../components/Badge/Badge';
import ExportButtons from '../../components/ExportButtons/ExportButtons';
import {
  getUsuarios,
  getUsuario,
  createUsuario,
  updateUsuario,
  deleteUsuario
} from '../../services/api';
import { mensajeError } from '../../services/api';
import styles from './Usuarios.module.css';

const USUARIO_VACIO = {
  nombre: '',
  email: '',
  contrasena: '',
  rol: 'user',
  telefono: '',
  direccion: ''
};

const Usuarios = () => {
  const [usuarios, setUsuarios] = useState([]);
  const [modalAbierto, setModalAbierto] = useState(false);
  const [detalleAbierto, setDetalleAbierto] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);
  const [detalle, setDetalle] = useState(null);
  const [errorModal, setErrorModal] = useState('');
  const [formData, setFormData] = useState(USUARIO_VACIO);

  const columns = [
    { key: 'id', label: 'ID' },
    { key: 'nombre', label: 'Nombre' },
    { key: 'email', label: 'Correo' },
    { key: 'rol', label: 'Rol', render: (u) => <Badge tipo={u.rol} /> },
    { key: 'fecha_registro', label: 'Registro' }
  ];

  useEffect(() => {
    fetchUsuarios();
  }, []);

  const fetchUsuarios = async () => {
    try {
      const response = await getUsuarios();
      setUsuarios(response.data);
    } catch (error) {
      console.error('Error al obtener usuarios:', error);
    }
  };

  const handleOpenModal = (user = null) => {
    setErrorModal('');
    if (user) {
      setCurrentUser(user);
      setFormData({
        nombre: user.nombre,
        email: user.email,
        contrasena: '',
        rol: user.rol || 'user',
        telefono: user.telefono || '',
        direccion: user.direccion || ''
      });
    } else {
      setCurrentUser(null);
      setFormData(USUARIO_VACIO);
    }
    setModalAbierto(true);
  };

  const verDetalle = async (user) => {
    try {
      const response = await getUsuario(user.id);
      setDetalle(response.data);
      setDetalleAbierto(true);
    } catch (error) {
      alert(mensajeError(error));
    }
  };

  const handleCloseModal = () => {
    setModalAbierto(false);
    setCurrentUser(null);
    setErrorModal('');
    setFormData(USUARIO_VACIO);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorModal('');

    try {
      if (currentUser) {
        const datos = { ...formData };
        if (!datos.contrasena) {
          delete datos.contrasena;
        }
        await updateUsuario(currentUser.id, datos);
      } else {
        await createUsuario(formData);
      }
      fetchUsuarios();
      handleCloseModal();
    } catch (error) {
      setErrorModal(mensajeError(error));
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('¿Estás seguro de eliminar este usuario? Esta acción no se puede deshacer.')) {
      return;
    }

    try {
      const response = await deleteUsuario(id);
      alert(response.data.message);
      fetchUsuarios();
    } catch (error) {
      alert(mensajeError(error));
    }
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <div>
          <h1 className={styles.title}>Usuarios</h1>
          <p className={styles.subtitle}>Gestión de usuarios de la biblioteca</p>
        </div>
        <div className={styles.headerAcciones}>
          <ExportButtons seccion="usuarios" />
          <button className={styles.addBtn} onClick={() => handleOpenModal()}>
            + Nuevo Usuario
          </button>
        </div>
      </div>

      <Table
        columns={columns}
        data={usuarios}
        onView={verDetalle}
        onEdit={handleOpenModal}
        onDelete={handleDelete}
      />

      <Modal
        isOpen={detalleAbierto}
        onClose={() => setDetalleAbierto(false)}
        title="Detalle del Usuario"
      >
        {detalle && (
          <div className={styles.detalleGrid}>
            <p><strong>Nombre:</strong> {detalle.nombre}</p>
            <p><strong>Correo:</strong> {detalle.email}</p>
            <p><strong>Rol:</strong> <Badge tipo={detalle.rol} /></p>
            <p><strong>Teléfono:</strong> {detalle.telefono || '-'}</p>
            <p><strong>Dirección:</strong> {detalle.direccion || '-'}</p>
            <p><strong>Fecha de registro:</strong> {detalle.fecha_registro}</p>
          </div>
        )}
      </Modal>

      <Modal
        isOpen={modalAbierto}
        onClose={handleCloseModal}
        title={currentUser ? 'Editar Usuario' : 'Nuevo Usuario'}
      >
        <form onSubmit={handleSubmit}>
          {errorModal && (
            <div className={styles.errorAlerta} role="alert">{errorModal}</div>
          )}

          <div className={styles.formGroup}>
            <label>Nombre *</label>
            <input
              type="text"
              name="nombre"
              value={formData.nombre}
              onChange={handleChange}
              required
            />
          </div>
          <div className={styles.formGroup}>
            <label>Email *</label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              required
            />
          </div>
          <div className={styles.formRow}>
            <div className={styles.formGroup}>
              <label>
                Contraseña {currentUser ? '(dejar vacío para no cambiar)' : '*'}
              </label>
              <input
                type="password"
                name="contrasena"
                value={formData.contrasena}
                onChange={handleChange}
                minLength="6"
                placeholder="Mínimo 6 caracteres"
                required={!currentUser}
                autoComplete="new-password"
              />
            </div>
            <div className={styles.formGroup}>
              <label>Rol *</label>
              <select
                name="rol"
                value={formData.rol}
                onChange={handleChange}
                required
              >
                <option value="user">Usuario</option>
                <option value="bibliotecario">Bibliotecario</option>
                <option value="admin">Administrador</option>
              </select>
            </div>
          </div>
          <div className={styles.formGroup}>
            <label>Teléfono</label>
            <input
              type="text"
              name="telefono"
              value={formData.telefono}
              onChange={handleChange}
            />
          </div>
          <div className={styles.formGroup}>
            <label>Dirección</label>
            <input
              type="text"
              name="direccion"
              value={formData.direccion}
              onChange={handleChange}
            />
          </div>
          <div className={styles.formActions}>
            <button type="button" className={styles.btnSecondary} onClick={handleCloseModal}>
              Cancelar
            </button>
            <button type="submit" className={styles.btnPrimary}>
              {currentUser ? 'Actualizar' : 'Guardar'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default Usuarios;
