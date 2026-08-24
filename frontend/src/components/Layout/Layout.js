import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import styles from './Layout.module.css';

const MENU_ADMIN = [
  { path: '/', label: 'Dashboard', icon: '📊' },
  { path: '/usuarios', label: 'Usuarios', icon: '👥' },
  { path: '/libros', label: 'Libros', icon: '📚' },
  { path: '/prestamos', label: 'Préstamos', icon: '📋' },
  { path: '/perfil', label: 'Perfil', icon: '👤' }
];

const MENU_USUARIO = [
  { path: '/', label: 'Dashboard', icon: '📊' },
  { path: '/libros', label: 'Libros', icon: '📚' },
  { path: '/mis-prestamos', label: 'Mis Préstamos', icon: '📋' },
  { path: '/perfil', label: 'Perfil', icon: '👤' }
];

const Layout = ({ children }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const { usuario, esAdmin, cerrarSesion } = useAuth();
  const [menuAbierto, setMenuAbierto] = useState(false);

  const menuItems = esAdmin ? MENU_ADMIN : MENU_USUARIO;

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
          <h2>📚 Biblioteca</h2>
        </div>

        <ul className={styles.menu}>
          {menuItems.map((item) => (
            <li key={item.path}>
              <Link
                to={item.path}
                className={`${styles.menuItem} ${location.pathname === item.path ? styles.active : ''}`}
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
            <span className={styles.avatar}>{usuario && usuario.nombre ? usuario.nombre.charAt(0).toUpperCase() : '?'}</span>
            <div>
              <p className={styles.nombreUsuario}>{usuario ? usuario.nombre : ''}</p>
              <p className={styles.rolUsuario}>{esAdmin ? 'Administrador' : 'Usuario'}</p>
            </div>
          </div>
          <button className={styles.btnSalir} onClick={cerrarSesionYRedirigir}>
            Cerrar sesión
          </button>
        </div>
      </nav>

      <header className={styles.barraMovil}>
        <button className={styles.hamburger} onClick={() => setMenuAbierto(true)} aria-label="Abrir menú">
          ☰
        </button>
        <span className={styles.tituloMovil}>📚 Biblioteca</span>
      </header>

      <main className={styles.main}>
        {children}
      </main>
    </div>
  );
};

export default Layout;
