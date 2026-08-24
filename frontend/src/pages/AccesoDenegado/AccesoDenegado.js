import React from 'react';
import { Link } from 'react-router-dom';
import styles from './AccesoDenegado.module.css';

const AccesoDenegado = () => {
  return (
    <div className={styles.contenedor}>
      <div className={styles.icono}>🔒</div>
      <h1>Acceso denegado</h1>
      <p>No tienes permisos para acceder a esta sección.</p>
      <Link to="/" className={styles.volver}>
        Volver al inicio
      </Link>
    </div>
  );
};

export default AccesoDenegado;
