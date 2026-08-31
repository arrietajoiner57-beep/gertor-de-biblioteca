import React from 'react';
import { descargarReporte } from '../../services/api';
import styles from './ExportButtons.module.css';

const ExportButtons = ({ seccion, soloAdmin = false }) => {
  const handleDescargar = async (formato) => {
    try {
      await descargarReporte(seccion, formato);
    } catch (error) {
      alert(error.message || 'No se pudo generar el reporte');
    }
  };

  return (
    <div className={styles.wrapper}>
      <span className={styles.label}>Exportar</span>
      <button
        type="button"
        className={`${styles.btn} ${styles.btnExcel}`}
        onClick={() => handleDescargar('excel')}
        title="Descargar en Excel"
      >
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
          <polyline points="14 2 14 8 20 8"/>
          <line x1="8" y1="13" x2="16" y2="13"/>
          <line x1="8" y1="17" x2="12" y2="17"/>
        </svg>
        Excel
      </button>
      <button
        type="button"
        className={`${styles.btn} ${styles.btnPdf}`}
        onClick={() => handleDescargar('pdf')}
        title="Descargar en PDF"
      >
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
          <polyline points="14 2 14 8 20 8"/>
          <line x1="8" y1="13" x2="16" y2="13"/>
          <line x1="8" y1="17" x2="16" y2="17"/>
          <line x1="8" y1="21" x2="16" y2="21"/>
        </svg>
        PDF
      </button>
    </div>
  );
};

export default ExportButtons;
