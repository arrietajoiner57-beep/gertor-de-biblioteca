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
  user: styles.azul,
  favorito: styles.violeta
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

function Badge({ tipo, children }) {
  const color = COLORES[tipo] || styles.azul;
  const etiqueta = children || ETIQUETAS[tipo] || tipo;

  return <span className={`${styles.badge} ${color}`}>{etiqueta}</span>;
}

export default Badge;