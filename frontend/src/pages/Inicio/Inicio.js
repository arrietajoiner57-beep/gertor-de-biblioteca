import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { getStatsAdmin, getStatsBibliotecario, getStatsUsuario } from '../../services/api';
import Badge from '../../components/Badge/Badge';
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
  return valor.split(' ')[0];
}

const DashboardSkeleton = () => {
  return (
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
};

function GraficoEstadoPrestamos({ datos }) {
  const dataColors = [
    { key: 'prestamosActivos', label: 'Activos', color: '#3b82f6' },
    { key: 'prestamosPendientes', label: 'Pendientes', color: '#f59e0b' },
    { key: 'prestamosVencidos', label: 'Vencidos', color: '#ef4444' },
    { key: 'prestamosDevueltos', label: 'Devueltos', color: '#10b981' }
  ].filter((d) => d.key in datos);

  const chartData = [{
    name: 'Prestamos',
    ...Object.fromEntries(dataColors.map((d) => [d.label, Number(datos[d.key]) || 0]))
  }];

  const colors = Object.fromEntries(dataColors.map((d) => [d.label, d.color]));

  return (
    <ResponsiveContainer width="100%" height={260}>
      <BarChart data={chartData} barSize={44}>
        <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" vertical={false} />
        <XAxis dataKey="name" tick={{ fill: '#64748b', fontSize: 12 }} axisLine={false} tickLine={false} />
        <YAxis allowDecimals={false} tick={{ fill: '#64748b', fontSize: 12 }} axisLine={false} tickLine={false} width={24} />
        <Tooltip
          cursor={{ fill: 'rgba(201,168,76,0.08)' }}
          contentStyle={{ borderRadius: 12, border: '1px solid #e2e8f0', fontSize: 13 }}
        />
        <Legend />
        {dataColors.map((d) => (
          <Bar key={d.label} dataKey={d.label} fill={colors[d.label]} radius={[6, 6, 0, 0]} />
        ))}
      </BarChart>
    </ResponsiveContainer>
  );
}

function GraficoLibros({ disponibles, prestados }) {
  const data = [
    { name: 'Disponibles', value: Number(disponibles) || 0, color: '#10b981' },
    { name: 'Prestados', value: Number(prestados) || 0, color: '#c9a84c' }
  ].filter((d) => d.value > 0);

  if (data.length === 0) {
    return <p className={styles.graficoVacio}>Sin datos suficientes para mostrar</p>;
  }

  return (
    <ResponsiveContainer width="100%" height={260}>
      <PieChart>
        <Pie
          data={data}
          dataKey="value"
          nameKey="name"
          cx="50%"
          cy="50%"
          innerRadius={60}
          outerRadius={90}
          paddingAngle={4}
          stroke="none"
        >
          {data.map((entry) => (
            <Cell key={entry.name} fill={entry.color} />
          ))}
        </Pie>
        <Tooltip contentStyle={{ borderRadius: 12, border: '1px solid #e2e8f0', fontSize: 13 }} />
        <Legend />
      </PieChart>
    </ResponsiveContainer>
  );
}

const DashboardAdmin = () => {
  const [stats, setStats] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    getStatsAdmin()
      .then((response) => setStats(response.data))
      .catch(() => setError('No se pudieron cargar las estadisticas'));
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
        <div className={`${styles.card} ${styles.cardUsuarios}`}>
          <div className={styles.cardIcon}>
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/>
              <circle cx="9" cy="7" r="4"/>
              <path d="M23 21v-2a4 4 0 0 0-3-3.87"/>
              <path d="M16 3.13a4 4 0 0 1 0 7.75"/>
            </svg>
          </div>
          <div className={styles.cardInfo}>
            <h3>{stats.totalUsuarios}</h3>
            <p>Usuarios Registrados</p>
          </div>
        </div>

        <div className={`${styles.card} ${styles.cardLibros}`}>
          <div className={styles.cardIcon}>
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"/>
              <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"/>
            </svg>
          </div>
          <div className={styles.cardInfo}>
            <h3>{stats.totalLibros}</h3>
            <p>Libros en Catalogo</p>
          </div>
        </div>

        <div className={`${styles.card} ${styles.cardDisponibles}`}>
          <div className={styles.cardIcon}>
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/>
              <polyline points="22 4 12 14.01 9 11.01"/>
            </svg>
          </div>
          <div className={styles.cardInfo}>
            <h3>{stats.librosDisponibles}</h3>
            <p>Ejemplares Disponibles</p>
          </div>
        </div>

        <div className={`${styles.card} ${styles.cardPrestados}`}>
          <div className={styles.cardIcon}>
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"/>
              <path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"/>
            </svg>
          </div>
          <div className={styles.cardInfo}>
            <h3>{stats.librosPrestados}</h3>
            <p>Ejemplares Prestados</p>
          </div>
        </div>
      </div>

      <div className={styles.secciones}>
        <div className={styles.seccion}>
          <h2>Estado de los prestamos</h2>
          <GraficoEstadoPrestamos datos={datosPrestamos} />
        </div>

        <div className={styles.seccion}>
          <h2>Distribucion de ejemplares</h2>
          <GraficoLibros disponibles={stats.librosDisponibles} prestados={stats.librosPrestados} />
        </div>
      </div>

      <div className={styles.secciones}>
        <div className={styles.seccion}>
          <h2>Ultimos prestamos</h2>
          <ul className={styles.listaReciente}>
            {stats.recientes.prestamos.length === 0 && <li className={styles.vacio}>Sin prestamos todavia</li>}
            {stats.recientes.prestamos.map((p) => (
              <li key={p.id}>
                <div>
                  <strong>{p.nombre_usuario}</strong>
                  <small>Prestamo #{p.id} - {formatearFecha(p.fecha_prestamo)}</small>
                </div>
                <Badge tipo={p.estado} />
              </li>
            ))}
          </ul>

          <h2>Ultimos usuarios</h2>
          <ul className={styles.listaReciente}>
            {stats.recientes.usuarios.map((u) => (
              <li key={u.id}>
                <div>
                  <strong>{u.nombre}</strong>
                  <small>{u.email}</small>
                </div>
                <Badge tipo={u.rol} />
              </li>
            ))}
          </ul>

          <h2>Ultimos libros agregados</h2>
          <ul className={styles.listaReciente}>
            {stats.recientes.libros.map((l) => (
              <li key={l.id}>
                <div>
                  <strong>{l.titulo}</strong>
                  <small>{l.autor}</small>
                </div>
                <span className={styles.stock}>{l.cantidad_disponible} disp.</span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </>
  );
};

const DashboardBibliotecario = () => {
  const [stats, setStats] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    getStatsBibliotecario()
      .then((response) => setStats(response.data))
      .catch(() => setError('No se pudieron cargar las estadisticas'));
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
        <div className={`${styles.card} ${styles.cardLibros}`}>
          <div className={styles.cardIcon}>
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"/>
              <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"/>
            </svg>
          </div>
          <div className={styles.cardInfo}>
            <h3>{stats.totalLibros}</h3>
            <p>Libros en Catalogo</p>
          </div>
        </div>

        <div className={`${styles.card} ${styles.cardDisponibles}`}>
          <div className={styles.cardIcon}>
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/>
              <polyline points="22 4 12 14.01 9 11.01"/>
            </svg>
          </div>
          <div className={styles.cardInfo}>
            <h3>{stats.librosDisponibles}</h3>
            <p>Ejemplares Disponibles</p>
          </div>
        </div>

        <div className={`${styles.card} ${styles.cardActivos}`}>
          <div className={styles.cardIcon}>
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
              <polyline points="14 2 14 8 20 8"/>
            </svg>
          </div>
          <div className={styles.cardInfo}>
            <h3>{stats.prestamosActivos}</h3>
            <p>Prestamos Activos</p>
          </div>
        </div>

        <div className={`${styles.card} ${styles.cardPendientes}`}>
          <div className={styles.cardIcon}>
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="10"/>
              <polyline points="12 6 12 12 16 14"/>
            </svg>
          </div>
          <div className={styles.cardInfo}>
            <h3>{stats.prestamosPendientes}</h3>
            <p>Prestamos Pendientes</p>
          </div>
        </div>
      </div>

      <div className={styles.secciones}>
        <div className={styles.seccion}>
          <h2>Estado de los prestamos</h2>
          <GraficoEstadoPrestamos datos={datosPrestamos} />
        </div>

        <div className={styles.seccion}>
          <h2>Distribucion de ejemplares</h2>
          <GraficoLibros disponibles={stats.librosDisponibles} prestados={stats.librosPrestados} />
        </div>
      </div>

      <div className={styles.secciones}>
        <div className={styles.seccion}>
          <h2>Ultimos prestamos</h2>
          <ul className={styles.listaReciente}>
            {stats.recientes.prestamos.length === 0 && <li className={styles.vacio}>Sin prestamos todavia</li>}
            {stats.recientes.prestamos.map((p) => (
              <li key={p.id}>
                <div>
                  <strong>{p.nombre_usuario}</strong>
                  <small>Prestamo #{p.id} - {formatearFecha(p.fecha_prestamo)}</small>
                </div>
                <Badge tipo={p.estado} />
              </li>
            ))}
          </ul>

          <h2>Ultimos libros agregados</h2>
          <ul className={styles.listaReciente}>
            {stats.recientes.libros.map((l) => (
              <li key={l.id}>
                <div>
                  <strong>{l.titulo}</strong>
                  <small>{l.autor}</small>
                </div>
                <span className={styles.stock}>{l.cantidad_disponible} disp.</span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </>
  );
};

const DashboardUsuario = () => {
  const [stats, setStats] = useState(null);
  const [error, setError] = useState('');
  const { usuario } = useAuth();

  useEffect(() => {
    getStatsUsuario()
      .then((response) => setStats(response.data))
      .catch(() => setError('No se pudo cargar tu informacion'));
  }, []);

  if (error) return <p className={styles.errorMsg}>{error}</p>;
  if (!stats) return <DashboardSkeleton />;

  return (
    <>
      <div className={styles.bienvenida}>
        <h2>Hola, {usuario ? usuario.nombre.split(' ')[0] : ''} &#x1F44B;</h2>
        <p>Aqui esta el resumen de tu actividad en la biblioteca</p>
      </div>

      <div className={styles.cards}>
        <div className={`${styles.card} ${styles.cardActivos}`}>
          <div className={styles.cardIcon}>
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
              <polyline points="14 2 14 8 20 8"/>
              <line x1="16" y1="13" x2="8" y2="13"/>
              <line x1="16" y1="17" x2="8" y2="17"/>
            </svg>
          </div>
          <div className={styles.cardInfo}>
            <h3>{stats.prestamosActivos}</h3>
            <p>Prestamos Activos</p>
          </div>
        </div>

        <div className={`${styles.card} ${styles.cardLibros}`}>
          <div className={styles.cardIcon}>
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"/>
              <path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"/>
            </svg>
          </div>
          <div className={styles.cardInfo}>
            <h3>{stats.librosPrestados}</h3>
            <p>Libros Contigo</p>
          </div>
        </div>

        <div className={`${styles.card} ${styles.cardVencidos}`}>
          <div className={styles.cardIcon}>
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="10"/>
              <line x1="12" y1="8" x2="12" y2="12"/>
              <line x1="12" y1="16" x2="12.01" y2="16"/>
            </svg>
          </div>
          <div className={styles.cardInfo}>
            <h3>{stats.prestamosVencidos}</h3>
            <p>Prestamos Vencidos</p>
          </div>
        </div>

        <div className={`${styles.card} ${styles.cardDisponibles}`}>
          <div className={styles.cardIcon}>
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <rect x="3" y="4" width="18" height="18" rx="2" ry="2"/>
              <line x1="16" y1="2" x2="16" y2="6"/>
              <line x1="8" y1="2" x2="8" y2="6"/>
              <line x1="3" y1="10" x2="21" y2="10"/>
            </svg>
          </div>
          <div className={styles.cardInfo}>
            <h3 className={styles.fechaCard}>{formatearFecha(stats.proximaEntrega)}</h3>
            <p>Proxima Entrega</p>
          </div>
        </div>
      </div>

      <div className={styles.seccionUnica}>
        <div className={styles.seccion}>
          <h2>Tus ultimos prestamos</h2>
          <ul className={styles.listaReciente}>
            {stats.historial.length === 0 && (
              <li className={styles.vacio}>
                Aun no tienes prestamos. Explora el catalogo en la seccion Libros.
              </li>
            )}
            {stats.historial.map((p) => (
              <li key={p.id}>
                <div>
                  <strong>Prestamo #{p.id}</strong>
                  <small>
                    {formatearFecha(p.fecha_prestamo)} - entregar antes del {formatearFecha(p.fecha_devolucion)}
                  </small>
                </div>
                <Badge tipo={p.estado} />
              </li>
            ))}
          </ul>
        </div>
      </div>
    </>
  );
};

const Inicio = () => {
  const { esAdmin, esBibliotecario, usuario } = useAuth();

  const getSubtitle = () => {
    if (esAdmin) return 'Resumen general de la biblioteca';
    if (esBibliotecario) return 'Panel de gestion de la biblioteca';
    return `Bienvenido${usuario && usuario.nombre ? `, ${usuario.nombre}` : ''}`;
  };

  return (
    <div className={styles.container}>
      <h1 className={styles.title}>Dashboard</h1>
      <p className={styles.subtitle}>{getSubtitle()}</p>

      {esAdmin && <DashboardAdmin />}
      {esBibliotecario && <DashboardBibliotecario />}
      {!esAdmin && !esBibliotecario && <DashboardUsuario />}
    </div>
  );
};

export default Inicio;
