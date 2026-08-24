import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { getStatsAdmin, getStatsUsuario } from '../../services/api';
import Badge from '../../components/Badge/Badge';
import styles from './Inicio.module.css';

function formatearFecha(valor) {
  if (!valor) return '-';
  return valor.split(' ')[0];
}

const DashboardAdmin = () => {
  const [stats, setStats] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    getStatsAdmin()
      .then((response) => setStats(response.data))
      .catch(() => setError('No se pudieron cargar las estadísticas'));
  }, []);

  if (error) return <p className={styles.errorMsg}>{error}</p>;
  if (!stats) return <p className={styles.cargando}>Cargando...</p>;

  const totalPrestamos = stats.prestamosActivos + stats.prestamosVencidos + stats.prestamosDevueltos || 1;
  const barras = [
    { etiqueta: 'Activos', valor: stats.prestamosActivos, color: '#3498db' },
    { etiqueta: 'Vencidos', valor: stats.prestamosVencidos, color: '#e74c3c' },
    { etiqueta: 'Devueltos', valor: stats.prestamosDevueltos, color: '#2ecc71' }
  ];

  return (
    <>
      <div className={styles.cards}>
        <div className={`${styles.card} ${styles.usuarios}`}>
          <div className={styles.cardIcon}>👥</div>
          <div className={styles.cardInfo}>
            <h3>{stats.totalUsuarios}</h3>
            <p>Usuarios Registrados</p>
          </div>
        </div>

        <div className={`${styles.card} ${styles.libros}`}>
          <div className={styles.cardIcon}>📚</div>
          <div className={styles.cardInfo}>
            <h3>{stats.totalLibros}</h3>
            <p>Libros en Catálogo</p>
          </div>
        </div>

        <div className={`${styles.card} ${styles.disponibles}`}>
          <div className={styles.cardIcon}>✅</div>
          <div className={styles.cardInfo}>
            <h3>{stats.librosDisponibles}</h3>
            <p>Ejemplares Disponibles</p>
          </div>
        </div>

        <div className={`${styles.card} ${styles.prestamos}`}>
          <div className={styles.cardIcon}>📖</div>
          <div className={styles.cardInfo}>
            <h3>{stats.librosPrestados}</h3>
            <p>Ejemplares Prestados</p>
          </div>
        </div>

        <div className={`${styles.card} ${styles.activos}`}>
          <div className={styles.cardIcon}>📋</div>
          <div className={styles.cardInfo}>
            <h3>{stats.prestamosActivos}</h3>
            <p>Préstamos Activos</p>
          </div>
        </div>

        <div className={`${styles.card} ${styles.vencidos}`}>
          <div className={styles.cardIcon}>⚠️</div>
          <div className={styles.cardInfo}>
            <h3>{stats.prestamosVencidos}</h3>
            <p>Préstamos Vencidos</p>
          </div>
        </div>

        <div className={`${styles.card} ${styles.devueltos}`}>
          <div className={styles.cardIcon}>🎉</div>
          <div className={styles.cardInfo}>
            <h3>{stats.prestamosDevueltos}</h3>
            <p>Préstamos Devueltos</p>
          </div>
        </div>
      </div>

      <div className={styles.secciones}>
        <div className={styles.seccion}>
          <h2>Estado de los préstamos</h2>
          {barras.map((b) => (
            <div key={b.etiqueta} className={styles.barraFila}>
              <span className={styles.barraEtiqueta}>{b.etiqueta}</span>
              <div className={styles.barraPista}>
                <div
                  className={styles.barraRelleno}
                  style={{ width: `${Math.round((b.valor / totalPrestamos) * 100)}%`, background: b.color }}
                />
              </div>
              <span className={styles.barraValor}>{b.valor}</span>
            </div>
          ))}
        </div>

        <div className={styles.seccion}>
          <h2>Últimos préstamos</h2>
          <ul className={styles.listaReciente}>
            {stats.recientes.prestamos.length === 0 && <li className={styles.vacio}>Sin préstamos todavía</li>}
            {stats.recientes.prestamos.map((p) => (
              <li key={p.id}>
                <div>
                  <strong>{p.nombre_usuario}</strong>
                  <small>Préstamo #{p.id} · {formatearFecha(p.fecha_prestamo)}</small>
                </div>
                <Badge tipo={p.estado} />
              </li>
            ))}
          </ul>

          <h2>Últimos usuarios</h2>
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

          <h2>Últimos libros agregados</h2>
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
      .catch(() => setError('No se pudo cargar tu información'));
  }, []);

  if (error) return <p className={styles.errorMsg}>{error}</p>;
  if (!stats) return <p className={styles.cargando}>Cargando...</p>;

  return (
    <>
      <div className={`${styles.bienvenida}`}>
        <h2>Hola, {usuario ? usuario.nombre.split(' ')[0] : ''} 👋</h2>
        <p>Aquí está el resumen de tu actividad en la biblioteca</p>
      </div>

      <div className={styles.cards}>
        <div className={`${styles.card} ${styles.activos}`}>
          <div className={styles.cardIcon}>📋</div>
          <div className={styles.cardInfo}>
            <h3>{stats.prestamosActivos}</h3>
            <p>Préstamos Activos</p>
          </div>
        </div>

        <div className={`${styles.card} ${styles.libros}`}>
          <div className={styles.cardIcon}>📖</div>
          <div className={styles.cardInfo}>
            <h3>{stats.librosPrestados}</h3>
            <p>Libros Contigo</p>
          </div>
        </div>

        <div className={`${styles.card} ${styles.vencidos}`}>
          <div className={styles.cardIcon}>⚠️</div>
          <div className={styles.cardInfo}>
            <h3>{stats.prestamosVencidos}</h3>
            <p>Préstamos Vencidos</p>
          </div>
        </div>

        <div className={`${styles.card} ${styles.disponibles}`}>
          <div className={styles.cardIcon}>📅</div>
          <div className={styles.cardInfo}>
            <h3 className={styles.fechaCard}>{formatearFecha(stats.proximaEntrega)}</h3>
            <p>Próxima Entrega</p>
          </div>
        </div>
      </div>

      <div className={styles.seccionUnica}>
        <div className={styles.seccion}>
          <h2>Tus últimos préstamos</h2>
          <ul className={styles.listaReciente}>
            {stats.historial.length === 0 && (
              <li className={styles.vacio}>
                Aún no tienes préstamos. Explora el catálogo en la sección Libros.
              </li>
            )}
            {stats.historial.map((p) => (
              <li key={p.id}>
                <div>
                  <strong>Préstamo #{p.id}</strong>
                  <small>
                    {formatearFecha(p.fecha_prestamo)} → entregar antes del {formatearFecha(p.fecha_devolucion)}
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
  const { esAdmin, usuario } = useAuth();

  return (
    <div className={styles.container}>
      <h1 className={styles.title}>Dashboard</h1>
      <p className={styles.subtitle}>
        {esAdmin ? 'Resumen general de la biblioteca' : `Bienvenido${usuario && usuario.nombre ? `, ${usuario.nombre}` : ''}`}
      </p>

      {esAdmin ? <DashboardAdmin /> : <DashboardUsuario />}
    </div>
  );
};

export default Inicio;
