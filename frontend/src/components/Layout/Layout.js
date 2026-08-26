import React, { useState } from 'react';
import { Link, Outlet, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import styles from './Layout.module.css';

const MENU_ADMIN = [
  { path: '/app', label: 'Dashboard', icon: '📊' },
  { path: '/app/usuarios', label: 'Usuarios', icon: '👥' },
  { path: '/app/libros', label: 'Libros', icon: '📚' },
  { path: '/app/prestamos', label: 'Prestamos', icon: '📋' },
  { path: '/app/mis-prestamos', label: 'Mis Prestamos', icon: '📖' },
  { path: '/app/perfil', label: 'Perfil', icon: '👤' }
];

const MENU_BIBLIOTECARIO = [
  { path: '/app', label: 'Dashboard', icon: '📊' },
  { path: '/app/libros', label: 'Libros', icon: '📚' },
  { path: '/app/prestamos', label: 'Prestamos', icon: '📋' },
  { path: '/app/mis-prestamos', label: 'Mis Prestamos', icon: '📖' },
  { path: '/app/perfil', label: 'Perfil', icon: '👤' }
];

const MENU_USUARIO = [
  { path: '/app', label: 'Dashboard', icon: '📊' },
  { path: '/app/libros', label: 'Libros', icon: '📚' },
  { path: '/app/mis-prestamos', label: 'Mis Prestamos', icon: '📋' },
  { path: '/app/perfil', label: 'Perfil', icon: '👤' }
];

const Layout = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { usuario, esAdmin, esBibliotecario, cerrarSesion } = useAuth();
  const [menuAbierto, setMenuAbierto] = useState(false);

  let menuItems;
  if (esAdmin) menuItems = MENU_ADMIN;
  else if (esBibliotecario) menuItems = MENU_BIBLIOTECARIO;
  else menuItems = MENU_USUARIO;

  const rolDisplay = esAdmin ? 'Administrador' : esBibliotecario ? 'Bibliotecario' : 'Usuario';

  const cerrarSesionYRedirigir = () => {
    cerrarSesion();
    navigate('/login', { replace: true });
  };

  return (
    <div className={styles.layout}>
      <div
        className={`${styles.overlay} ${menuAbierto ? styles.overlayVisible : ''}`}
        onClick={() => setMenuAbierto(false)}
      />
      <nav className={`${styles.sidebar} ${menuAbierto ? styles.sidebarAbierta : ''}`}>
        <div className={styles.logo}>
          <div className={styles.logoIcon}>
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"/>
              <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"/>
            </svg>
          </div>
          <h2>Biblioteca</h2>
        </div>

        <ul className={styles.menu}>
          {menuItems.map((item) => (
            <li key={item.path}>
              <Link
                to={item.path}
                className={`${styles.menuItem} ${
                  item.path === '/app'
                    ? location.pathname === '/app' ? styles.active : ''
                    : location.pathname.startsWith(item.path) ? styles.active : ''
                }`}
                onClick={() => setMenuAbierto(false)}
              >
                <span className={styles.icon}>{item.icon}</span>
                <span>{item.label}</span>
              </Link>
            </li>
          ))}
        </ul>

        <div className={styles.pieSidebar}>
          <div className={styles.infoUsuario}>
            <span className={styles.avatar}>
              {usuario && usuario.nombre ? usuario.nombre.charAt(0).toUpperCase() : '?'}
            </span>
            <div className={styles.datosUsuario}>
              <p className={styles.nombreUsuario}>{usuario ? usuario.nombre : ''}</p>
              <span className={`${styles.rolBadge} ${
                esAdmin ? styles.rolAdmin : esBibliotecario ? styles.rolBibliotecario : styles.rolUser
              }`}>
                {rolDisplay}
              </span>
            </div>
          </div>
          <button className={styles.btnSalir} onClick={cerrarSesionYRedirigir}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/>
              <polyline points="16 17 21 12 16 7"/>
              <line x1="21" y1="12" x2="9" y2="12"/>
            </svg>
            Cerrar sesion
          </button>
        </div>
      </nav>

      <header className={styles.barraMovil}>
        <button className={styles.hamburger} onClick={() => setMenuAbierto(true)} aria-label="Abrir menu">
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <line x1="3" y1="12" x2="21" y2="12"/>
            <line x1="3" y1="6" x2="21" y2="6"/>
            <line x1="3" y1="18" x2="21" y2="18"/>
          </svg>
        </button>
        <span className={styles.tituloMovil}>Biblioteca</span>
      </header>

      <main className={styles.main}>
        <Outlet />
      </main>
    </div>
  );
};

export default Layout;
