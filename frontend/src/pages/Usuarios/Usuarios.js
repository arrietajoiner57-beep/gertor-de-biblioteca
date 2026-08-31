import React, { useState, useEffect } from 'react';
import Modal from '../../components/Modal/Modal';
import Badge from '../../components/Badge/Badge';
import ExportButtons from '../../components/ExportButtons/ExportButtons';
import {
  getUsuarios,
  getUsuario,
  createUsuario,
  updateUsuario,
  deleteUsuario,
  mensajeError
} from '../../services/api';
import { useToasts } from '../../context/ToastContext';
import styles from './Usuarios.module.css';

const USUARIO_VACIO = {
  nombre: '',
  email: '',
  contrasena: '',
  rol: 'user',
  telefono: '',
  direccion: ''
};

const ROL_ETIQUETA = {
  admin: 'Administrador',
  bibliotecario: 'Bibliotecario',
  user: 'Lector'
};

const ROL_ICONO = {
  admin: '🛡️',
  bibliotecario: '🗂️',
  user: '📚'
};

const iniciares = (nombre) => {
  const partes = nombre
    .split(' ')
    .filter(Boolean)
    .map((p) => p.charAt(0).toUpperCase());
  return partes.slice(0, 2).join('') || nombre.charAt(0).toUpperCase();
};

const formatFecha = (f) => {
  if (!f) return '-';
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

const Usuarios = () => {
  const [usuarios, setUsuarios] = useState([]);
  const [busqueda, setBusqueda] = useState('');
  const [vista, setVista] = useState('tarjetas');
  const [rolFiltro, setRolFiltro] = useState('todos');
  const [modalAbierto, setModalAbierto] = useState(false);
  const [detalleAbierto, setDetalleAbierto] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);
  const [detalle, setDetalle] = useState(null);
  const [errorModal, setErrorModal] = useState('');
  const [formData, setFormData] = useState(USUARIO_VACIO);
  const toasts = useToasts();

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

  const filtrados = usuarios.filter((u) => {
    const coincideRol = rolFiltro === 'todos' || u.rol === rolFiltro;
    const q = busqueda.toLowerCase();
    const coincideTexto =
      !q ||
      u.nombre.toLowerCase().includes(q) ||
      u.email.toLowerCase().includes(q) ||
      (u.telefono || '').includes(q);
    return coincideRol && coincideTexto;
  });

  const conteoRol = (rol) => usuarios.filter((u) => u.rol === rol).length;

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
      toasts.error(mensajeError(error));
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
        toasts.exito('Usuario actualizado correctamente');
      } else {
        await createUsuario(formData);
        toasts.exito('Usuario creado correctamente');
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
      toasts.exito(response.data.message);
      fetchUsuarios();
    } catch (error) {
      toasts.error(mensajeError(error));
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
          <p className={styles.subtitle}>Comunidad de lectores de la biblioteca</p>
        </div>
        <div className={styles.headerAcciones}>
          <ExportButtons seccion="usuarios" />
          <button className={styles.addBtn} onClick={() => handleOpenModal()}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>
            </svg>
            Nuevo Usuario
          </button>
        </div>
      </div>

      {/* ===== Toolbar ===== */}
      <div className={styles.toolbar}>
        <input
          type="search"
          className={styles.buscador}
          placeholder="🔍 Buscar por nombre, correo o teléfono..."
          value={busqueda}
          onChange={(e) => setBusqueda(e.target.value)}
        />
        <div className={styles.vistaToggle}>
          <button
            className={`${styles.vistaBtn} ${vista === 'tarjetas' ? styles.vistaActiva : ''}`}
            onClick={() => setVista('tarjetas')}
            title="Vista tarjetas"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/>
              <rect x="14" y="14" width="7" height="7" rx="1"/><rect x="3" y="14" width="7" height="7" rx="1"/>
            </svg>
            Tarjetas
          </button>
          <button
            className={`${styles.vistaBtn} ${vista === 'lista' ? styles.vistaActiva : ''}`}
            onClick={() => setVista('lista')}
            title="Vista lista"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="8" y1="6" x2="21" y2="6"/><line x1="8" y1="12" x2="21" y2="12"/><line x1="8" y1="18" x2="21" y2="18"/>
              <circle cx="4" cy="6" r="1"/><circle cx="4" cy="12" r="1"/><circle cx="4" cy="18" r="1"/>
            </svg>
            Lista
          </button>
        </div>
      </div>

      {/* ===== Resumen por rol ===== */}
      <div className={styles.resumen}>
        {[
          { rol: 'todos', etiqueta: 'Todos', icono: '✨', cuenta: usuarios.length },
          { rol: 'admin', etiqueta: 'Administradores', icono: '🛡️', cuenta: conteoRol('admin') },
          { rol: 'bibliotecario', etiqueta: 'Bibliotecarios', icono: '🗂️', cuenta: conteoRol('bibliotecario') },
          { rol: 'user', etiqueta: 'Lectores', icono: '📚', cuenta: conteoRol('user') }
        ].map((r) => (
          <button
            key={r.rol}
            className={`${styles.resumenItem} ${rolFiltro === r.rol ? styles.resumenActivo : ''}`}
            onClick={() => setRolFiltro(r.rol)}
          >
            <span className={styles.resumenIcono}>{r.icono}</span>
            <span className={styles.resumenCuenta}>{r.cuenta}</span>
            <span className={styles.resumenEtiqueta}>{r.etiqueta}</span>
          </button>
        ))}
      </div>

      {/* ===== Tarjetas ===== */}
      {vista === 'tarjetas' ? (
        <div className={styles.grilla}>
          {filtrados.map((usuario) => (
            <article key={usuario.id} className={`${styles.userCard} ${styles['tarjeta_' + usuario.rol]}`}>
              <div className={styles.cabecera}>
                <span className={`${styles.avatar} ${styles['avatar_' + usuario.rol]}`}>
                  {iniciares(usuario.nombre)}
                </span>
                <div className={styles.cabeceraInfo}>
                  <h3>{usuario.nombre}</h3>
                  <Badge tipo={usuario.rol} />
                </div>
                <span className={styles.iconoRol}>{ROL_ICONO[usuario.rol]}</span>
              </div>

              <ul className={styles.datosLista}>
                <li>
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/>
                  </svg>
                  {usuario.email}
                </li>
                <li>
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 22 16.92z"/>
                  </svg>
                  {usuario.telefono || 'Sin teléfono'}
                </li>
                <li>
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/>
                  </svg>
                  Registrado el {formatFecha(usuario.fecha_registro)}
                </li>
              </ul>

              <div className={styles.acciones}>
                <button className={styles.quickBtn} onClick={() => verDetalle(usuario)}>
                  Ver
                </button>
                <button className={`${styles.quickBtn} ${styles.quickEditar}`} onClick={() => handleOpenModal(usuario)}>
                  Editar
                </button>
                <button className={`${styles.quickBtn} ${styles.quickEliminar}`} onClick={() => handleDelete(usuario.id)}>
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6"/>
                  </svg>
                  Eliminar
                </button>
              </div>
            </article>
          ))}
          {filtrados.length === 0 && (
            <p className={styles.vacio}>No hay usuarios que coincidan con tus filtros.</p>
          )}
        </div>
      ) : (
        <div className={styles.lista}>
          {filtrados.map((usuario) => (
            <article key={usuario.id} className={styles.listaRow}>
              <span className={`${styles.avatar} ${styles['avatar_' + usuario.rol]} ${styles.avatarSm}`}>
                {iniciares(usuario.nombre)}
              </span>
              <div className={styles.listaInfo}>
                <h3>{usuario.nombre}</h3>
                <p>{usuario.email}</p>
              </div>
              <div className={styles.listaRol}>
                <Badge tipo={usuario.rol} />
              </div>
              <div className={styles.listaFecha}>{formatFecha(usuario.fecha_registro)}</div>
              <div className={styles.listaAcciones}>
                <button className={styles.quickBtn} onClick={() => verDetalle(usuario)}>Ver</button>
                <button className={`${styles.quickBtn} ${styles.quickEditar}`} onClick={() => handleOpenModal(usuario)}>Editar</button>
                <button className={`${styles.quickBtn} ${styles.quickEliminar}`} onClick={() => handleDelete(usuario.id)}>Eliminar</button>
              </div>
            </article>
          ))}
          {filtrados.length === 0 && (
            <p className={styles.vacio}>No hay usuarios que coincidan con tus filtros.</p>
          )}
        </div>
      )}

      {/* ===== Modal detalle ===== */}
      <Modal
        isOpen={detalleAbierto}
        onClose={() => setDetalleAbierto(false)}
        title="Detalle del Usuario"
      >
        {detalle && (
          <div className={styles.detalleWrap}>
            <div className={styles.detallePerfil}>
              <span className={`${styles.avatar} ${styles['avatar_' + detalle.rol]} ${styles.avatarLg}`}>
                {iniciares(detalle.nombre)}
              </span>
              <h3>{detalle.nombre}</h3>
              <Badge tipo={detalle.rol} />
              <p className={styles.detalleMembresia}>
                {ROL_ICONO[detalle.rol]} {ROL_ETIQUETA[detalle.rol] || detalle.rol}
              </p>
            </div>
            <div className={styles.detalleGrid}>
              <p><strong>Correo:</strong> {detalle.email}</p>
              <p><strong>Teléfono:</strong> {detalle.telefono || '-'}</p>
              <p><strong>Dirección:</strong> {detalle.direccion || '-'}</p>
              <p><strong>Registro:</strong> {formatFecha(detalle.fecha_registro)}</p>
            </div>
          </div>
        )}
      </Modal>

      {/* ===== Modal crear/editar ===== */}
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
                <option value="user">Lector</option>
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