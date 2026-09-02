import React, { useState, useEffect, useRef } from 'react';
import { Link, Outlet, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import styles from './Layout.module.css';

const Icono = {
  dashboard: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="3" width="7" height="9" rx="1.5"/><rect x="14" y="3" width="7" height="5" rx="1.5"/>
      <rect x="14" y="12" width="7" height="9" rx="1.5"/><rect x="3" y="16" width="7" height="5" rx="1.5"/>
    </svg>
  ),
  usuarios: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/>
      <path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/>
    </svg>
  ),
  libros: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"/><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"/>
    </svg>
  ),
  prestamos: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
      <path d="M14 2v6h6"/><path d="M8 17h8"/><path d="M8 13h8"/>
    </svg>
  ),
  misPrestamos: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"/>
      <path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"/>
    </svg>
  ),
  perfil: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/>
    </svg>
  ),
  chevron: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="6 9 12 15 18 9"/>
    </svg>
  ),
  search: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="11" cy="11" r="8"/><path d="M21 21l-4.35-4.35"/>
    </svg>
  ),
  bell: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9"/>
      <path d="M10.3 21a1.94 1.94 0 0 0 3.4 0"/>
    </svg>
  ),
  logout: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/>
      <polyline points="16 17 21 12 16 7"/>
      <line x1="21" y1="12" x2="9" y2="12"/>
    </svg>
  ),
  clock: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/>
    </svg>
  )
};

const MENU_ADMIN = [
  { path: '/app', label: 'Inicio', icon: 'dashboard' },
  { path: '/app/usuarios', label: 'Usuarios', icon: 'usuarios' },
  { path: '/app/libros', label: 'Libros', icon: 'libros' },
  { path: '/app/prestamos', label: 'Préstamos', icon: 'prestamos' },
  { path: '/app/mis-prestamos', label: 'Mis Préstamos', icon: 'misPrestamos' },
  { path: '/app/perfil', label: 'Perfil', icon: 'perfil' }
];

const MENU_BIBLIOTECARIO = [
  { path: '/app', label: 'Inicio', icon: 'dashboard' },
  { path: '/app/libros', label: 'Libros', icon: 'libros' },
  { path: '/app/prestamos', label: 'Préstamos', icon: 'prestamos' },
  { path: '/app/mis-prestamos', label: 'Mis Préstamos', icon: 'misPrestamos' },
  { path: '/app/perfil', label: 'Perfil', icon: 'perfil' }
];

const MENU_USUARIO = [
  { path: '/app', label: 'Inicio', icon: 'dashboard' },
  { path: '/app/libros', label: 'Libros', icon: 'libros' },
  { path: '/app/mis-prestamos', label: 'Mis Préstamos', icon: 'misPrestamos' },
  { path: '/app/perfil', label: 'Perfil', icon: 'perfil' }
];

const TITULOS = {
  '/app': 'Inicio',
  '/app/usuarios': 'Usuarios',
  '/app/libros': 'Libros',
  '/app/prestamos': 'Préstamos',
  '/app/mis-prestamos': 'Mis Préstamos',
  '/app/perfil': 'Perfil'
};

/* ===== Floating Dock (barra de navegación flotante) ===== */
const FloatingDock = ({ items, activo, onNavegar }) => {
  const dockRef = useRef(null);
  const [pillPos, setPillPos] = useState({ left: 0, width: 0 });

  useEffect(() => {
    if (!dockRef.current) return;
    const act = dockRef.current.querySelector(`button[data-path="${activo}"]`);
    if (act) {
      setPillPos({ left: act.offsetLeft, width: act.offsetWidth });
    }
  }, [activo]);

  return (
    <nav className={styles.dockWrap}>
      <div className={styles.dock} ref={dockRef}>
        <span
          className={styles.dockPill}
          style={{ left: `${pillPos.left}px`, width: `${pillPos.width}px` }}
        />
        {items.map((item) => {
          const es = item.path === activo;
          return (
            <button
              key={item.path}
              data-path={item.path}
              className={`${styles.dockItem} ${es ? styles.dockItemActivo : ''}`}
              onClick={() => onNavegar(item.path)}
              aria-label={item.label}
              aria-current={es ? 'page' : undefined}
            >
              <span className={styles.dockIcon}>{Icono[item.icon]}</span>
              <span className={styles.tooltip}>
                {item.label}
                <span className={styles.tooltipArrow} />
              </span>
            </button>
          );
        })}
      </div>
    </nav>
  );
};

/* ===== Paleta de comandos (acceso rápido a secciones) ===== */
const CommandPalette = ({ items, abierto, onCerrar, onSeleccionar }) => {
  const [query, setQuery] = useState('');
  const [activoIdx, setActivoIdx] = useState(0);
  const inputRef = useRef(null);

  useEffect(() => {
    if (abierto) {
      setQuery('');
      setActivoIdx(0);
      setTimeout(() => inputRef.current && inputRef.current.focus(), 30);
    }
  }, [abierto]);

  if (!abierto) return null;

  const resultados = items.filter((it) =>
    it.label.toLowerCase().includes(query.trim().toLowerCase())
  );

  const seleccionar = (it) => {
    onSeleccionar(it.path);
    onCerrar();
  };

  const manejarKey = (e) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setActivoIdx((a) => Math.min(a + 1, resultados.length - 1));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setActivoIdx((a) => Math.max(a - 1, 0));
    } else if (e.key === 'Enter' && resultados[activoIdx]) {
      seleccionar(resultados[activoIdx]);
    } else if (e.key === 'Escape') {
      onCerrar();
    }
  };

  return (
    <div className={styles.paletteOverlay} onClick={onCerrar}>
      <div className={styles.palette} onClick={(e) => e.stopPropagation()}>
        <div className={styles.paletteInput}>
          <span className={styles.paletteIcon}>{Icono.search}</span>
          <input
            ref={inputRef}
            value={query}
            onChange={(e) => { setQuery(e.target.value); setActivoIdx(0); }}
            onKeyDown={manejarKey}
            placeholder="Buscar una sección..."
          />
          <button type="button" className={styles.paletteEsc} onClick={onCerrar}>ESC</button>
        </div>
        <ul className={styles.paletteLista}>
          {resultados.length === 0 && (
            <li className={styles.paletteVacio}>Sin resultados para &ldquo;{query}&rdquo;</li>
          )}
          {resultados.map((it, i) => (
            <li
              key={it.path}
              className={`${styles.paletteItem} ${i === activoIdx ? styles.paletteItemActivo : ''}`}
              onMouseEnter={() => setActivoIdx(i)}
              onClick={() => seleccionar(it)}
            >
              <span className={styles.paletteItemIcon}>{Icono[it.icon]}</span>
              <span className={styles.paletteItemLabel}>{it.label}</span>
              <span className={styles.paletteItemGo}>→</span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
};

const Layout = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { usuario, esAdmin, esBibliotecario, cerrarSesion } = useAuth();
  const [paletteAbierta, setPaletteAbierta] = useState(false);
  const [perfilAbierto, setPerfilAbierto] = useState(false);
  const profileRef = useRef(null);

  let menuItems;
  if (esAdmin) menuItems = MENU_ADMIN;
  else if (esBibliotecario) menuItems = MENU_BIBLIOTECARIO;
  else menuItems = MENU_USUARIO;

  const rolDisplay = esAdmin ? 'Administrador' : esBibliotecario ? 'Bibliotecario' : 'Lector';
  const roldisplay = esAdmin ? 'admin' : esBibliotecario ? 'bibliotecario' : 'user';
  const tituloActual = TITULOS[location.pathname] || 'Inicio';

  const iniciales = (nombre) =>
    nombre
      ? nombre.split(' ').filter(Boolean).map((p) => p.charAt(0).toUpperCase()).slice(0, 2).join('')
      : '?';

  useEffect(() => {
    const manejar = (e) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        setPaletteAbierta((a) => !a);
        setPerfilAbierto(false);
      }
    };
    window.addEventListener('keydown', manejar);
    return () => window.removeEventListener('keydown', manejar);
  }, []);

  useEffect(() => {
    const manejarClick = (e) => {
      if (profileRef.current && !profileRef.current.contains(e.target)) {
        setPerfilAbierto(false);
      }
    };
    document.addEventListener('mousedown', manejarClick);
    return () => document.removeEventListener('mousedown', manejarClick);
  }, []);

  const cerrarSesionYRedirigir = () => {
    cerrarSesion();
    navigate('/login', { replace: true });
  };

  return (
    <div className={styles.layout}>
      <div className={styles.ambient}>
        <span className={styles.orb} style={{ top: '-8%', left: '6%' }} />
        <span className={styles.orb} style={{ top: '30%', right: '-8%' }} />
        <span className={styles.orb} style={{ bottom: '-10%', left: '40%' }} />
      </div>

      {/* ===== Esquina superior derecha: perfil + acceso rápido ===== */}
      <header className={styles.topbar}>
        <div className={styles.topbarIzq}>
          <h1 className={styles.topbarTitulo}>
            <span className={styles.topbarGlow} />
            {tituloActual}
          </h1>
        </div>

        <button className={styles.buscador} onClick={() => setPaletteAbierta(true)}>
          <span className={styles.buscadorIcon}>{Icono.search}</span>
          <span className={styles.buscadorTexto}>Buscar sección...</span>
          <kbd className={styles.atajo}>Ctrl K</kbd>
        </button>

        <div className={styles.topbarDer} ref={profileRef}>
          <button
            className={`${styles.perfilTrigger} ${perfilAbierto ? styles.perfilTriggerAbierto : ''}`}
            onClick={() => setPerfilAbierto((a) => !a)}
            aria-haspopup="menu"
            aria-expanded={perfilAbierto}
          >
            <span className={`${styles.avatarMini} ${styles[`avatarRol_${roldisplay}`]}`}>
              {usuario ? iniciales(usuario.nombre) : '?'}
              <span className={styles.avatarDotMini} />
            </span>
            <span className={styles.perfilTexto}>
              <strong>{usuario ? usuario.nombre.split(' ')[0] : ''}</strong>
              <small>{rolDisplay}</small>
            </span>
            <span className={styles.perfilChevron}>{Icono.chevron}</span>
          </button>

          {perfilAbierto && (
            <div className={styles.perfilPanel} role="menu">
              <div className={styles.perfilCabecera}>
                <span className={`${styles.avatarLg} ${styles[`avatarRol_${roldisplay}`]}`}>
                  {usuario ? iniciales(usuario.nombre) : '?'}
                  <span className={styles.avatarDotLg} />
                </span>
                <div>
                  <strong>{usuario ? usuario.nombre : ''}</strong>
                  <small>{usuario ? usuario.email : ''}</small>
                </div>
              </div>
              <Link to="/app/perfil" className={styles.perfilItem} onClick={() => setPerfilAbierto(false)}>
                <span className={styles.perfilItemIcon}>{Icono.perfil}</span>
                Mi Perfil
              </Link>
              <div className={styles.perfilDivisor} />
              <button className={`${styles.perfilItem} ${styles.perfilSalir}`} onClick={cerrarSesionYRedirigir}>
                <span className={styles.perfilItemIcon}>{Icono.logout}</span>
                Cerrar Sesión
              </button>
            </div>
          )}
        </div>
      </header>

      {/* ===== Contenido ===== */}
      <main className={styles.main}>
        <Outlet />
      </main>

      {/* ===== Floating Dock ===== */}
      <FloatingDock items={menuItems} activo={location.pathname} onNavegar={(p) => navigate(p)} />

      <CommandPalette
        items={menuItems}
        abierto={paletteAbierta}
        onCerrar={() => setPaletteAbierta(false)}
        onSeleccionar={(path) => navigate(path)}
      />
    </div>
  );
};

export default Layout;
