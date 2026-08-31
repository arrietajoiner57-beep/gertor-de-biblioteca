import React, { createContext, useContext, useState, useCallback } from 'react';
import styles from './ToastContext.module.css';

const ToastContext = createContext(null);

let contador = 0;

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);

  const eliminar = useCallback((id) => {
    setToasts((actual) => actual.filter((t) => t.id !== id));
  }, []);

  const agregar = useCallback(
    (mensaje, tipo = 'info', duracion = 4500) => {
      const id = ++contador;
      setToasts((actual) => [...actual, { id, mensaje, tipo }]);
      if (duracion > 0) {
        setTimeout(() => eliminar(id), duracion);
      }
      return id;
    },
    [eliminar]
  );

  const api = {
    exito: (m, d) => agregar(m, 'exito', d),
    error: (m, d) => agregar(m, 'error', d),
    info: (m, d) => agregar(m, 'info', d),
    agregar,
    eliminar
  };

  const iconos = { exito: '✓', error: '✕', info: 'ℹ' };

  return (
    <ToastContext.Provider value={api}>
      {children}
      <div className={styles.container}>
        {toasts.map((t) => (
          <div key={t.id} className={`${styles.toast} ${styles[t.tipo]}`} role="status">
            <span className={styles.icono}>{iconos[t.tipo] || iconos.info}</span>
            <span className={styles.mensaje}>{t.mensaje}</span>
            <button className={styles.cerrar} onClick={() => eliminar(t.id)} aria-label="Cerrar">×</button>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}

export function useToasts() {
  return useContext(ToastContext);
}
