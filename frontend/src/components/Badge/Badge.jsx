import React from 'react';
import styles from './Badge.module.css';

const COLORES = {
  activo: styles.azul,
  devuelto: styles.verde,
  vencido: styles.rojo,
  pendiente: styles.naranja,
  disponible: styles.verde,
  agotado: styles.rojo,
  admin: styles.dorado,
  bibliotecario: styles.esmeralda,
  user: styles.azul
};

const ETIQUETAS = {
  activo: 'Activo',
  devuelto: 'Devuelto',
  vencido: 'Vencido',
  pendiente: 'Pendiente',
  disponible: 'Disponible',
  agotado: 'Agotado',
  admin: 'Administrador',
  bibliotecario: 'Bibliotecario',
  user: 'Usuario'
};

function Badge({ tipo }) {
  const color = COLORES[tipo] || styles.azul;
  const etiqueta = ETIQUETAS[tipo] || tipo;

  return <span className={`${styles.badge} ${color}`}>{etiqueta}</span>;
}

export default Badge;
