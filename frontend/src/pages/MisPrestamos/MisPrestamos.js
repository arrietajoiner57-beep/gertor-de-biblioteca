import React, { useState, useEffect } from 'react';
import Table from '../../components/Table/Table';
import Badge from '../../components/Badge/Badge';
import { getMisPrestamos, mensajeError } from '../../services/api';
import styles from './MisPrestamos.module.css';

const FILTROS = [
  { valor: '', etiqueta: 'Todos' },
  { valor: 'pendiente', etiqueta: 'Pendientes' },
  { valor: 'activo', etiqueta: 'Activos' },
  { valor: 'vencido', etiqueta: 'Vencidos' },
  { valor: 'devuelto', etiqueta: 'Devueltos' }
];

const MisPrestamos = () => {
  const [prestamos, setPrestamos] = useState([]);
  const [filtro, setFiltro] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    fetchPrestamos(filtro);
  }, [filtro]);

  const fetchPrestamos = async (estado) => {
    try {
      setError('');
      const response = await getMisPrestamos(estado || undefined);
      setPrestamos(response.data);
    } catch (err) {
      setError(mensajeError(err, 'No se pudieron cargar tus préstamos'));
    }
  };

  const columns = [
    { key: 'id', label: 'ID' },
    {
      key: 'libros',
      label: 'Libros',
      render: (row) => (
        <span>
          {row.detalles
            ? row.detalles.map((d) => `${d.titulo_libro} x${d.cantidad}`).join(', ')
            : '-'}
        </span>
      )
    },
    { key: 'fecha_prestamo', label: 'Fecha Préstamo' },
    { key: 'fecha_devolucion', label: 'Entregar Antes de' },
    { key: 'estado', label: 'Estado', render: (row) => <Badge tipo={row.estado} /> }
  ];

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <div>
          <h1 className={styles.title}>Mis Préstamos</h1>
          <p className={styles.subtitle}>Historial y estado de tus préstamos</p>
        </div>
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

      {error && <p className={styles.errorMsg}>{error}</p>}

      {!error && (
        <Table columns={columns} data={prestamos} />
      )}
    </div>
  );
};

export default MisPrestamos;
