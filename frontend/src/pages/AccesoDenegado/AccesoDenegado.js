import React from 'react';
import { Link } from 'react-router-dom';
import styles from './AccesoDenegado.module.css';

const AccesoDenegado = () => {
  return (
    <div className={styles.contenedor}>
      <div className={styles.icono}>
        <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
          <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/>
          <path d="M7 11V7a5 5 0 0 1 10 0v4"/>
        </svg>
      </div>
      <h1>Acceso denegado</h1>
      <p>No tienes permisos para acceder a esta seccion.</p>
      <Link to="/app" className={styles.volver}>
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
          <path d="M19 12H5M12 19l-7-7 7-7"/>
        </svg>
        Volver al inicio
      </Link>
    </div>
  );
};

export default AccesoDenegado;
