import React, { useState } from 'react';
import styles from './LectorToolbar.module.css';

const TEMAS_OPCIONES = [
  { id: 'dia', label: 'Día', color: '#ffffff', textColor: '#1a1a1a' },
  { id: 'sepia', label: 'Sepia', color: '#F4ECD8', textColor: '#3d2314' },
  { id: 'noche', label: 'Noche', color: '#1A1A1A', textColor: '#d4c8b8' }
];

const FUENTES = [
  { id: 'default', label: 'Predeterminada' },
  { id: 'opendyslexic', label: 'OpenDyslexic' },
  { id: 'sans-serif', label: 'Sans-serif' }
];

const IDIOMAS = [
  { id: 'es', label: 'Español' },
  { id: 'en', label: 'Inglés' },
  { id: 'fr', label: 'Francés' },
  { id: 'pt', label: 'Portugués' },
  { id: 'de', label: 'Alemán' },
  { id: 'it', label: 'Italiano' },
  { id: 'ru', label: 'Ruso' }
];

const LectorToolbar = ({
  titulo,
  tema,
  onTemaChange,
  tamañoFuente,
  onFontZoom,
  onToggleFullScreen,
  pantallaCompleta,
  onVolver,
  ttsActivo,
  ttsLeyendo,
  onToggleTTS,
  onFontChange,
  fuente,
  paginaActual,
  totalPaginas,
  porcentaje,
  traduccionActiva,
  idiomaTraduccion,
  onIdiomaChange
}) => {
  const [menuAbierto, setMenuAbierto] = useState(null);

  const toggleMenu = (menu) => setMenuAbierto(menuAbierto === menu ? null : menu);

  return (
    <header className={styles.toolbar}>
      <div className={styles.left}>
        <button className={styles.btnIcon} onClick={onVolver} title="Volver al catálogo">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M19 12H5M12 19l-7-7 7-7"/>
          </svg>
        </button>
        <h1 className={styles.titulo}>{titulo}</h1>
      </div>

      <div className={styles.center}>
        {totalPaginas > 1 && (
          <span className={styles.pageIndicator}>
            {paginaActual} / {totalPaginas}
          </span>
        )}
        {porcentaje > 0 && (
          <span className={styles.progressBadge}>{porcentaje.toFixed(0)}%</span>
        )}
      </div>

      <div className={styles.right}>
        <div className={styles.menuWrap}>
          <button
            className={`${styles.btnIcon} ${menuAbierto === 'tema' ? styles.active : ''}`}
            onClick={() => toggleMenu('tema')}
            title="Cambiar tema"
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="5"/><path d="M12 1v2M12 21v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M1 12h2M21 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42"/>
            </svg>
          </button>
          {menuAbierto === 'tema' && (
            <div className={styles.dropdown}>
              <div className={styles.menuLabel}>Tema de lectura</div>
              {TEMAS_OPCIONES.map((t) => (
                <button
                  key={t.id}
                  className={`${styles.temaBtn} ${tema === t.id ? styles.temaActivo : ''}`}
                  onClick={() => { onTemaChange(t.id); setMenuAbierto(null); }}
                >
                  <span
                    className={styles.temaSwatch}
                    style={{ backgroundColor: t.color, borderColor: t.textColor, color: t.textColor }}
                  >
                    Aa
                  </span>
                  <span>{t.label}</span>
                  {tema === t.id && <span className={styles.checkIcono}>✓</span>}
                </button>
              ))}
            </div>
          )}
        </div>

        <div className={styles.menuWrap}>
          <button
            className={`${styles.btnIcon} ${menuAbierto === 'font' ? styles.active : ''}`}
            onClick={() => toggleMenu('font')}
            title="Opciones de texto"
          >
            <span className={styles.fontIcon}>Aa</span>
          </button>
          {menuAbierto === 'font' && (
            <div className={styles.dropdown}>
              <div className={styles.menuLabel}>Tamaño de texto</div>
              <div className={styles.zoomControls}>
                <button className={styles.zoomBtn} onClick={() => onFontZoom(-1)} title="Reducir">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="5" y1="12" x2="19" y2="12"/></svg>
                </button>
                <span className={styles.zoomVal}>{tamañoFuente}%</span>
                <button className={styles.zoomBtn} onClick={() => onFontZoom(1)} title="Aumentar">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
                </button>
              </div>
              <div className={styles.menuLabel}>Fuente</div>
              {FUENTES.map((f) => (
                <button
                  key={f.id}
                  className={`${styles.temaBtn} ${fuente === f.id ? styles.temaActivo : ''}`}
                  onClick={() => { onFontChange(f.id); setMenuAbierto(null); }}
                >
                  <span>{f.label}</span>
                  {fuente === f.id && <span className={styles.checkIcono}>✓</span>}
                </button>
              ))}
            </div>
          )}
        </div>

        <div className={styles.menuWrap}>
          <button
            className={`${styles.btnIcon} ${menuAbierto === 'traduccion' ? styles.active : ''} ${traduccionActiva ? styles.traduccionActiva : ''}`}
            onClick={() => toggleMenu('traduccion')}
            title={traduccionActiva ? `Traducción activa a ${idiomaTraduccion}` : 'Traducir lectura'}
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="10"/>
              <path d="M2 12h20M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/>
            </svg>
          </button>
          {menuAbierto === 'traduccion' && (
            <div className={styles.dropdown}>
              <div className={styles.menuLabel}>Idioma de lectura</div>
              <button
                className={`${styles.temaBtn} ${!traduccionActiva ? styles.temaActivo : ''}`}
                onClick={() => { onIdiomaChange(null); setMenuAbierto(null); }}
              >
                <span>📖 Texto original</span>
                {!traduccionActiva && <span className={styles.checkIcono}>✓</span>}
              </button>
              {IDIOMAS.map((i) => (
                <button
                  key={i.id}
                  className={`${styles.temaBtn} ${traduccionActiva && idiomaTraduccion === i.id ? styles.temaActivo : ''}`}
                  onClick={() => { onIdiomaChange(i.id); setMenuAbierto(null); }}
                >
                  <span>{i.label}</span>
                  {traduccionActiva && idiomaTraduccion === i.id && <span className={styles.checkIcono}>✓</span>}
                </button>
              ))}
            </div>
          )}
        </div>

        <button
          className={`${styles.btnIcon} ${ttsLeyendo ? styles.ttsActive : ''}`}
          onClick={onToggleTTS}
          title={ttsLeyendo ? 'Detener lectura en voz alta' : 'Leer en voz alta'}
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"/>
            {ttsLeyendo && (
              <>
                <path d="M19.07 4.93a10 10 0 0 1 0 14.14M15.54 8.46a5 5 0 0 1 0 7.07"/>
              </>
            )}
            {!ttsLeyendo && (
              <path d="M15.54 8.46a5 5 0 0 1 0 7.07"/>
            )}
          </svg>
        </button>

        <button
          className={styles.btnIcon}
          onClick={onToggleFullScreen}
          title={pantallaCompleta ? 'Salir de pantalla completa' : 'Modo lectura completa'}
        >
          {pantallaCompleta ? (
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M8 3v3a2 2 0 0 1-2 2H3m18 0h-3a2 2 0 0 1-2-2V3m0 18v-3a2 2 0 0 1 2-2h3M3 16h3a2 2 0 0 1 2 2v3"/>
            </svg>
          ) : (
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M8 3H5a2 2 0 0 0-2 2v3m18-5h-3m3 0v3m0 12v-3m0 3h-3M3 16v3a2 2 0 0 0 2 2h3"/>
            </svg>
          )}
        </button>
      </div>
    </header>
  );
};

export default LectorToolbar;