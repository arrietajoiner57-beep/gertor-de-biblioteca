import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { getStatsAdmin, getStatsBibliotecario, getStatsUsuario } from '../../services/api';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  Cell,
  PieChart,
  Pie,
  Legend
} from 'recharts';
import styles from './Inicio.module.css';

function formatearFecha(valor) {
  if (!valor) return '-';
  const [fecha, hora] = valor.split(' ');
  return hora ? `${fecha} · ${hora.split(':')[0]}:${hora.split(':')[1]}` : fecha;
}

const Iconos = {
  usuarios: (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/>
      <path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/>
    </svg>
  ),
  libros: (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"/><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"/>
    </svg>
  ),
  disponible: (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/>
    </svg>
  ),
  prestado: (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"/><path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"/>
    </svg>
  ),
  activo: (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/>
    </svg>
  ),
  pendiente: (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/>
    </svg>
  ),
  vencido: (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/>
    </svg>
  ),
  calendario: (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/>
    </svg>
  )
};

const TooltipPersonalizado = ({ active, payload, label }) => {
  if (!active || !payload || payload.length === 0) return null;
  return (
    <div className={styles.tooltipGlass}>
      <span className={styles.tooltipTitulo}>{label}</span>
      {payload.map((p, i) => (
        <span key={i} className={styles.tooltipFila}>
          <span
            className={styles.tooltipPunto}
            style={{ background: p.payload && p.payload.color ? p.payload.color : p.color }}
          />
          <span>{p.name}</span>
          <strong>{p.value}</strong>
        </span>
      ))}
    </div>
  );
};

/* ===== KPI Card glassmorphism con borde neón ===== */
const KpiCard = ({ numero, etiqueta, variante, icono, tendencia, nota }) => (
  <div className={`${styles.card} ${styles[`card_${variante}`]}`}>
    <div className={styles.cardGlow} />
    <div className={styles.cardTop}>
      <div className={styles.cardIcono}>{icono}</div>
      {tendencia && (
        <span className={styles.tendencia}>
          <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="23 6 13.5 15.5 8.5 10.5 1 18"/><polyline points="17 6 23 6 23 12"/>
          </svg>
          {tendencia}
        </span>
      )}
    </div>
    <p className={styles.cardNumero} title={nota}>{numero}</p>
    <p className={styles.cardEtiqueta}>{etiqueta}</p>
  </div>
);

const DashboardSkeleton = () => (
  <>
    <div className={styles.cards}>
      {[0, 1, 2, 3].map((i) => (
        <div key={i} className={`${styles.card} ${styles.skeletonCard}`}>
          <div className={`${styles.skeleton} ${styles.skeletonIcon}`} />
          <div className={styles.cardInfo}>
            <div className={`${styles.skeleton} ${styles.skeletonNum}`} />
            <div className={`${styles.skeleton} ${styles.skeletonText}`} />
          </div>
        </div>
      ))}
    </div>
    <div className={styles.secciones}>
      <div className={styles.seccion}>
        <div className={`${styles.skeleton} ${styles.skeletonBar}`} />
        <div className={`${styles.skeleton} ${styles.skeletonBlock}`} />
      </div>
      <div className={styles.seccion}>
        <div className={`${styles.skeleton} ${styles.skeletonBar}`} />
        <div className={`${styles.skeleton} ${styles.skeletonBlock}`} />
      </div>
    </div>
  </>
);

function GraficoEstadoPrestamos({ datos }) {
  const dataColors = [
    { key: 'prestamosActivos', label: 'Activos', color: '#3b82f6', grad: 'gradAzul' },
    { key: 'prestamosPendientes', label: 'Pendientes', color: '#f97316', grad: 'gradNaranja' },
    { key: 'prestamosVencidos', label: 'Vencidos', color: '#ef4444', grad: 'gradRojo' },
    { key: 'prestamosDevueltos', label: 'Devueltos', color: '#10b981', grad: 'gradVerde' }
  ].filter((d) => d.key in datos);

  const chartData = [{
    name: 'Préstamos',
    ...Object.fromEntries(dataColors.map((d) => [d.label, Number(datos[d.key]) || 0]))
  }];

  return (
    <ResponsiveContainer width="100%" height={280}>
      <BarChart data={chartData} barSize={46}>
        <defs>
          <linearGradient id="gradAzul" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#60a5fa" /><stop offset="100%" stopColor="#1d4ed8" />
          </linearGradient>
          <linearGradient id="gradNaranja" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#fb923c" /><stop offset="100%" stopColor="#c2410c" />
          </linearGradient>
          <linearGradient id="gradRojo" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#f87171" /><stop offset="100%" stopColor="#b91c1c" />
          </linearGradient>
          <linearGradient id="gradVerde" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#34d399" /><stop offset="100%" stopColor="#047857" />
          </linearGradient>
        </defs>
        <CartesianGrid strokeDasharray="3 3" stroke="rgba(148,163,184,0.1)" vertical={false} />
        <XAxis dataKey="name" tick={{ fill: '#94a3b8', fontSize: 12 }} axisLine={false} tickLine={false} />
        <YAxis allowDecimals={false} tick={{ fill: '#94a3b8', fontSize: 12 }} axisLine={false} tickLine={false} width={26} />
        <Tooltip content={<TooltipPersonalizado />} cursor={{ fill: 'rgba(139,92,246,0.06)' }} />
        <Legend wrapperStyle={{ fontSize: 13, color: '#94a3b8' }} iconType="circle" />
        {dataColors.map((d) => (
          <Bar
            key={d.label}
            dataKey={d.label}
            radius={[10, 10, 2, 2]}
            fill={`url(#${d.grad})`}
            fillOpacity={0.92}
          />
        ))}
      </BarChart>
    </ResponsiveContainer>
  );
}

function GraficoLibros({ disponibles, prestados }) {
  const data = [
    { name: 'Disponibles', value: Number(disponibles) || 0, color: '#10b981' },
    { name: 'Prestados', value: Number(prestados) || 0, color: '#3b82f6' }
  ].filter((d) => d.value > 0);

  const total = data.reduce((acc, d) => acc + d.value, 0);
  const ocupacion = total > 0 ? Math.round((prestados / total) * 100) : 0;

  if (data.length === 0) {
    return <p className={styles.graficoVacio}>Sin datos suficientes para mostrar</p>;
  }

  return (
    <div className={styles.donutWrap}>
      <ResponsiveContainer width="100%" height={280}>
        <PieChart>
          <defs>
            <linearGradient id="gradDonutVerde" x1="0" y1="0" x2="1" y2="1">
              <stop offset="0%" stopColor="#34d399" /><stop offset="100%" stopColor="#047857" />
            </linearGradient>
            <linearGradient id="gradDonutAzul" x1="0" y1="0" x2="1" y2="1">
              <stop offset="0%" stopColor="#60a5fa" /><stop offset="100%" stopColor="#1d4ed8" />
            </linearGradient>
          </defs>
          <Pie
            data={data}
            dataKey="value"
            nameKey="name"
            cx="50%"
            cy="50%"
            innerRadius={74}
            outerRadius={106}
            paddingAngle={5}
            cornerRadius={10}
            stroke="none"
          >
            {data.map((entry) => (
              <Cell key={entry.name} fill={entry.name === 'Disponibles' ? 'url(#gradDonutVerde)' : 'url(#gradDonutAzul)'} />
            ))}
          </Pie>
          <Tooltip content={(props) => <TooltipPersonalizado {...props} />} />
          <Legend wrapperStyle={{ fontSize: 13, color: '#94a3b8' }} iconType="circle" />
        </PieChart>
      </ResponsiveContainer>
      <div className={styles.donutCentro}>
        <strong>{ocupacion}%</strong>
        <span>ocupación</span>
      </div>
    </div>
  );
}

/* ===== Píldora de estado glow ===== */
const EstadoPill = ({ estado }) => {
  const mapa = {
    activo: 'Activo',
    pendiente: 'Pendiente',
    vencido: 'Vencido',
    devuelto: 'Devuelto'
  };
  return (
    <span className={`${styles.estadoPill} ${styles[`estado_${estado}`]}`}>
      {mapa[estado] || estado}
    </span>
  );
};

/* ===== Tabla "Últimos préstamos" con avatares y pills glow ===== */
const TablaPrestamos = ({ prestamos }) => (
  <div className={styles.tablaCard}>
    <div className={styles.tablaHeader}>
      <h3 className={styles.tablaTitulo}>
        <span className={styles.tablaTituloLinea} />
        Últimos préstamos
      </h3>
      <Link to="/app/prestamos" className={styles.tablaVerTodos}>Ver todos →</Link>
    </div>
    {prestamos.length === 0 ? (
      <p className={styles.tablaVacio}>Sin préstamos todavía</p>
    ) : (
      <div className={styles.tabla}>
        <div className={styles.tablaHead}>
          <span>Usuario</span>
          <span>Préstamo</span>
          <span>Fecha</span>
          <span>Estado</span>
        </div>
        {prestamos.map((p) => (
          <div key={p.id} className={styles.tablaRow}>
            <span className={styles.celdaUser}>
              <span className={styles.tablaAvatar}>{p.nombre_usuario ? p.nombre_usuario.charAt(0).toUpperCase() : '?'}</span>
              <strong>{p.nombre_usuario}</strong>
            </span>
            <span className={styles.celdaId}>#{p.id}</span>
            <span className={styles.celdaFecha}>{formatearFecha(p.fecha_prestamo)}</span>
            <span><EstadoPill estado={p.estado} /></span>
          </div>
        ))}
      </div>
    )}
  </div>
);

const FeedUsuarios = ({ usuarios }) => (
  <div className={styles.feedCard}>
    <h3 className={styles.feedTitulo}>
      <span className={styles.feedTituloLinea} />
      Últimos usuarios
    </h3>
    <ul className={styles.feedLista}>
      {usuarios.map((u) => (
        <li key={u.id} className={styles.filaFeed}>
          <span className={`${styles.feedAvatar} ${styles.feedAvatarDorado}`}>{u.nombre.charAt(0).toUpperCase()}</span>
          <div className={styles.feedInfo}>
            <strong>{u.nombre}</strong>
            <small>{u.email}</small>
          </div>
          <EstadoPill estado={u.rol === 'admin' ? 'activo' : u.rol} />
        </li>
      ))}
    </ul>
  </div>
);

const FeedLibros = ({ libros }) => (
  <div className={styles.feedCard}>
    <h3 className={styles.feedTitulo}>
      <span className={styles.feedTituloLinea} />
      Últimos libros
    </h3>
    <ul className={styles.feedLista}>
      {libros.map((l) => (
        <li key={l.id} className={styles.filaFeed}>
          <span className={`${styles.feedAvatar} ${styles.feedAvatarVioleta}`}>{l.titulo.charAt(0).toUpperCase()}</span>
          <div className={styles.feedInfo}>
            <strong>{l.titulo}</strong>
            <small>{l.autor}</small>
          </div>
          <span className={styles.stock}>{l.cantidad_disponible} disp.</span>
        </li>
      ))}
    </ul>
  </div>
);

const DashboardAdmin = () => {
  const [stats, setStats] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    getStatsAdmin().then((r) => setStats(r.data)).catch(() => setError('No se pudieron cargar las estadísticas'));
  }, []);

  if (error) return <p className={styles.errorMsg}>{error}</p>;
  if (!stats) return <DashboardSkeleton />;

  const datosPrestamos = {
    prestamosActivos: stats.prestamosActivos,
    prestamosPendientes: 0,
    prestamosVencidos: stats.prestamosVencidos,
    prestamosDevueltos: stats.prestamosDevueltos
  };

  return (
    <>
      <div className={styles.cards}>
        <KpiCard numero={stats.totalUsuarios} etiqueta="Usuarios Registrados" variante="violeta" icono={Iconos.usuarios} tendencia="+12%" />
        <KpiCard numero={stats.totalLibros} etiqueta="Libros en Catálogo" variante="dorado" icono={Iconos.libros} tendencia="+8%" />
        <KpiCard numero={stats.librosDisponibles} etiqueta="Ejemplares Disponibles" variante="esmeralda" icono={Iconos.disponible} tendencia="+5%" />
        <KpiCard numero={stats.librosPrestados} etiqueta="Ejemplares Prestados" variante="azul" icono={Iconos.prestado} tendencia="+3%" />
      </div>

      <div className={styles.secciones}>
        <div className={styles.seccion}>
          <h2>Estado de los préstamos</h2>
          <GraficoEstadoPrestamos datos={datosPrestamos} />
        </div>
        <div className={styles.seccion}>
          <h2>Distribución de ejemplares</h2>
          <GraficoLibros disponibles={stats.librosDisponibles} prestados={stats.librosPrestados} />
        </div>
      </div>

      <TablaPrestamos prestamos={stats.recientes.prestamos} />
      <div className={styles.feeds}>
        <FeedUsuarios usuarios={stats.recientes.usuarios} />
        <FeedLibros libros={stats.recientes.libros} />
      </div>
    </>
  );
};

const DashboardBibliotecario = () => {
  const [stats, setStats] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    getStatsBibliotecario().then((r) => setStats(r.data)).catch(() => setError('No se pudieron cargar las estadísticas'));
  }, []);

  if (error) return <p className={styles.errorMsg}>{error}</p>;
  if (!stats) return <DashboardSkeleton />;

  const datosPrestamos = {
    prestamosActivos: stats.prestamosActivos,
    prestamosPendientes: stats.prestamosPendientes,
    prestamosVencidos: stats.prestamosVencidos,
    prestamosDevueltos: stats.prestamosDevueltos
  };

  return (
    <>
      <div className={styles.cards}>
        <KpiCard numero={stats.totalLibros} etiqueta="Libros en Catálogo" variante="dorado" icono={Iconos.libros} tendencia="+8%" />
        <KpiCard numero={stats.librosDisponibles} etiqueta="Ejemplares Disponibles" variante="esmeralda" icono={Iconos.disponible} tendencia="+5%" />
        <KpiCard numero={stats.prestamosActivos} etiqueta="Préstamos Activos" variante="azul" icono={Iconos.activo} tendencia="+11%" />
        <KpiCard numero={stats.prestamosPendientes} etiqueta="Préstamos Pendientes" variante="esmeralda" icono={Iconos.pendiente} tendencia={stats.prestamosPendientes > 0 ? 'nuevos' : 'al día'} />
      </div>

      <div className={styles.secciones}>
        <div className={styles.seccion}>
          <h2>Estado de los préstamos</h2>
          <GraficoEstadoPrestamos datos={datosPrestamos} />
        </div>
        <div className={styles.seccion}>
          <h2>Distribución de ejemplares</h2>
          <GraficoLibros disponibles={stats.librosDisponibles} prestados={stats.librosPrestados} />
        </div>
      </div>

      <TablaPrestamos prestamos={stats.recientes.prestamos} />
      <FeedLibros libros={stats.recientes.libros} />
    </>
  );
};

const DashboardUsuario = () => {
  const [stats, setStats] = useState(null);
  const [error, setError] = useState('');
  const { usuario } = useAuth();

  useEffect(() => {
    getStatsUsuario().then((r) => setStats(r.data)).catch(() => setError('No se pudo cargar tu información'));
  }, []);

  if (error) return <p className={styles.errorMsg}>{error}</p>;
  if (!stats) return <DashboardSkeleton />;

  return (
    <>
      <div className={styles.bienvenida}>
        <div>
          <span className={styles.bienvenidaBadge}>Lector</span>
          <h2>Hola, {usuario ? usuario.nombre.split(' ')[0] : ''}</h2>
          <p>Aquí está el resumen de tu actividad en la biblioteca</p>
        </div>
        <Link to="/app/libros" className={styles.bienvenidaCta}>
          Explorar catálogo
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M5 12h14M12 5l7 7-7 7"/>
          </svg>
        </Link>
      </div>

      <div className={styles.cards}>
        <KpiCard numero={stats.prestamosActivos} etiqueta="Préstamos Activos" variante="azul" icono={Iconos.activo} />
        <KpiCard numero={stats.librosPrestados} etiqueta="Libros Contigo" variante="dorado" icono={Iconos.libros} />
        <KpiCard numero={stats.prestamosVencidos} etiqueta="Préstamos Vencidos" variante="rojo" icono={Iconos.vencido} />
        <KpiCard numero={formatearFecha(stats.proximaEntrega)} etiqueta="Próxima Entrega" variante="esmeralda" icono={Iconos.calendario} nota="Fecha límite de tu devolución más cercana" />
      </div>

      <TablaPrestamos prestamos={stats.historial} />
    </>
  );
};

const Inicio = () => {
  const { esAdmin, esBibliotecario, usuario } = useAuth();

  const getSubtitle = () => {
    if (esAdmin) return 'Resumen general de la biblioteca';
    if (esBibliotecario) return 'Panel de gestión de la biblioteca';
    return `Bienvenido${usuario && usuario.nombre ? `, ${usuario.nombre}` : ''}`;
  };

  return (
    <div className={styles.container}>
      <div className={styles.headerDash}>
        <div>
          <span className={styles.eyebrow}>Biblioteca</span>
          <h1 className={styles.title}>Inicio</h1>
        </div>
        <p className={styles.subtitle}>{getSubtitle()}</p>
      </div>

      {esAdmin && <DashboardAdmin />}
      {esBibliotecario && <DashboardBibliotecario />}
      {!esAdmin && !esBibliotecario && <DashboardUsuario />}
    </div>
  );
};

export default Inicio;
