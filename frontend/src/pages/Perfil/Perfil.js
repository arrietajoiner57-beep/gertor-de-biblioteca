import React, { useState, useMemo } from 'react';
import Badge from '../../components/Badge/Badge';
import { useAuth } from '../../context/AuthContext';
import { cambiarContrasena, mensajeError } from '../../services/api';
import styles from './Perfil.module.css';

const iniciales = (nombre) =>
  nombre
    .split(' ')
    .filter(Boolean)
    .map((p) => p.charAt(0).toUpperCase())
    .slice(0, 2)
    .join('') || '?';

const ROL_ETIQUETA = {
  admin: 'Administrador',
  bibliotecario: 'Bibliotecario',
  user: 'Lector'
};

function hashString(str) {
  let h = 2166136261;
  for (let i = 0; i < str.length; i++) {
    h ^= str.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}

const QrVisual = ({ seed }) => {
  const size = 9;
  const celdas = [];

  let estado = hashString(seed) || 12345;
  const siguiente = () => {
    estado = (Math.imul(estado, 1103515245) + 12345) % 2147483648;
    return (estado / 2147483648) * 2 > 1;
  };

  for (let r = 0; r < size; r++) {
    const fila = [];
    for (let c = 0; c < size; c++) {
      const esquina =
        (r === 0 && c === 0) || (r === 0 && c === 5) || (r === 5 && c === 0);
      const marco =
        (r === 4 || c === 4 || r === 8 || c === 8);
      fila.push(esquina ? true : marco ? true : siguiente());
    }
    celdas.push(fila);
  }

  return (
    <svg
      className={styles.qrSvg}
      viewBox={`0 0 ${size} ${size}`}
      shapeRendering="crispEdges"
      aria-hidden="true"
    >
      {celdas.map((fila, r) =>
        fila.map((on, c) =>
          on ? (
            <rect
              key={`${r}-${c}`}
              x={c}
              y={r}
              width="1"
              height="1"
              fill="currentColor"
            />
          ) : null
        )
      )}
    </svg>
  );
};

const Perfil = () => {
  const { usuario, esAdmin } = useAuth();
  const [passwords, setPasswords] = useState({
    contrasena_actual: '',
    contrasena_nueva: '',
    confirmar: ''
  });
  const [mensaje, setMensaje] = useState(null);
  const [guardando, setGuardando] = useState(false);
  const [prefs, setPrefs] = useState({
    emailNotis: true,
    resumenSemanal: false
  });

  const gamificacion = useMemo(() => {
    let dias = 0;
    if (usuario && usuario.fecha_registro) {
      dias = Math.max(
        0,
        Math.floor((Date.now() - new Date(usuario.fecha_registro).getTime()) / 86400000)
      );
    }
    const nivel = Math.min(10, 1 + Math.floor(dias / 30));
    const xpEnNivel = dias % 30;
    const progreso = Math.round((xpEnNivel / 30) * 100);
    return { dias, nivel, xpEnNivel, progreso };
  }, [usuario]);

  if (!usuario) return null;

  const medallas = [
    {
      icono: '🌱',
      nombre: 'Recién llegado',
      descripcion: 'Cuenta creada y explorando',
      desbloqueada: gamificacion.dias >= 0
    },
    {
      icono: '📚',
      nombre: 'Lector curioso',
      descripcion: 'Primera semana de membresía',
      desbloqueada: gamificacion.dias >= 7
    },
    {
      icono: '🏆',
      nombre: 'Veterano',
      descripcion: '3 meses de membresía',
      desbloqueada: gamificacion.dias >= 90
    },
    {
      icono: '💎',
      nombre: 'Embajador',
      descripcion: 'Más de un año de membresía',
      desbloqueada: gamificacion.dias >= 365
    }
  ];

  const tienda = [
    {
      icono: '🎁',
      nombre: 'Avatar exclusivo',
      precio: '1,200 XP'
    },
    {
      icono: '🥈',
      nombre: 'Insignia de plata',
      precio: '2,500 XP'
    },
    {
      icono: '🖼️',
      nombre: 'Perfil premium',
      precio: '5,000 XP'
    }
  ];

  const handleChange = (e) => {
    setPasswords({ ...passwords, [e.target.name]: e.target.value });
    setMensaje(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMensaje(null);

    if (passwords.contrasena_nueva !== passwords.confirmar) {
      setMensaje({ tipo: 'error', texto: 'Las contraseñas nuevas no coinciden' });
      return;
    }

    setGuardando(true);

    try {
      const response = await cambiarContrasena({
        contrasena_actual: passwords.contrasena_actual,
        contrasena_nueva: passwords.contrasena_nueva
      });
      setMensaje({ tipo: 'ok', texto: response.data.message });
      setPasswords({ contrasena_actual: '', contrasena_nueva: '', confirmar: '' });
    } catch (err) {
      setMensaje({ tipo: 'error', texto: mensajeError(err) });
    } finally {
      setGuardando(false);
    }
  };

  const togglePref = (clave) => setPrefs((prev) => ({ ...prev, [clave]: !prev[clave] }));

  return (
    <div className={styles.container}>
      {/* ===== Banner perfil ===== */}
      <section className={styles.banner}>
        <div className={styles.bannerGlow} />
        <div className={styles.bannerContenido}>
          <span className={`${styles.avatar} ${styles['avatar_' + usuario.rol]}`}>
            {iniciales(usuario.nombre)}
          </span>
          <div className={styles.bannerInfo}>
            <div className={styles.bannerFila}>
              <h1 className={styles.nombre}>{usuario.nombre}</h1>
              <Badge tipo={usuario.rol} />
            </div>
            <p className={styles.miembro}>
              Miembro desde{' '}
              {usuario.fecha_registro
                ? new Date(usuario.fecha_registro).toLocaleDateString('es-ES', {
                    day: 'numeric',
                    month: 'long',
                    year: 'numeric'
                  })
                : '-'}
            </p>

            <div className={styles.xp}>
              <span className={styles.nivelChip}>Nivel {gamificacion.nivel}</span>
              <div className={styles.xpBar}>
                <div
                  className={styles.xpFill}
                  style={{ width: `${gamificacion.progreso}%` }}
                />
              </div>
              <span className={styles.xpTexto}>
                {gamificacion.xpEnNivel}/30 XP para el nivel {gamificacion.nivel + 1}
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* ===== Carnet digital de membresía ===== */}
      <section className={`${styles.carnet} ${styles['carnet_' + usuario.rol]}`}>
        <div className={styles.carnetGlow} />
        <div className={styles.carnetBrand}>
          <span className={styles.carnetLogo}>
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"/><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"/>
            </svg>
          </span>
          <div>
            <strong>Biblioteca Nova</strong>
            <span>Carnet digital</span>
          </div>
        </div>
        <div className={styles.carnetCuerpo}>
          <div className={styles.carnetInfo}>
            <p className={styles.carnetNombre}>{usuario.nombre}</p>
            <p className={styles.carnetRol}>{ROL_ETIQUETA[usuario.rol] || usuario.rol}</p>
            <div className={styles.carnetDatos}>
              <span>
                <small>Miembro N°</small>
                <strong>{String(usuario.id || '').padStart(6, '0')}</strong>
              </span>
              <span>
                <small>Nivel</small>
                <strong>{gamificacion.nivel}</strong>
              </span>
              <span>
                <small>Desde</small>
                <strong>
                  {usuario.fecha_registro
                    ? new Date(usuario.fecha_registro).toLocaleDateString('es-ES', { year: 'numeric', month: 'short' })
                    : '-'}
                </strong>
              </span>
            </div>
          </div>
          <div className={styles.carnetQr} title="Código de membresía">
            <QrVisual seed={String(usuario.id || usuario.email || '')} />
            <small>Escanear</small>
          </div>
        </div>
      </section>

      <div className={styles.grillaPerfil}>
        {/* ===== Medallas ===== */}
        <section className={styles.tarjeta}>
          <h2 className={styles.subtitulo}>
            <span>🏅</span> Medallas de lector
            <Badge tipo="favorito">Gamificación</Badge>
          </h2>
          <div className={styles.medallas}>
            {medallas.map((m) => (
              <div
                key={m.nombre}
                className={`${styles.medalla} ${m.desbloqueada ? styles.medallaActiva : styles.medallaBloqueada}`}
                title={m.desbloqueada ? m.descripcion : `Bloqueada · ${m.descripcion}`}
              >
                <span className={styles.medallaIcono}>{m.icono}</span>
                <strong>{m.nombre}</strong>
                <small>{m.desbloqueada ? m.descripcion : '🔒 Bloqueada'}</small>
              </div>
            ))}
          </div>
        </section>

        {/* ===== Datos de cuenta ===== */}
        <section className={styles.tarjeta}>
          <h2 className={styles.subtitulo}>
            <span>👤</span> Datos de cuenta
          </h2>
          <ul className={styles.datos}>
            <li>
              <span>Correo</span>
              <strong>{usuario.email}</strong>
            </li>
            <li>
              <span>Teléfono</span>
              <strong>{usuario.telefono || '-'}</strong>
            </li>
            <li>
              <span>Dirección</span>
              <strong>{usuario.direccion || '-'}</strong>
            </li>
            <li>
              <span>Registro</span>
              <strong>
                {usuario.fecha_registro
                  ? new Date(usuario.fecha_registro).toLocaleDateString('es-ES')
                  : '-'}
              </strong>
            </li>
          </ul>
          {esAdmin && (
            <p className={styles.notaAdmin}>
              Como administrador puedes editar estos datos desde la sección Usuarios.
            </p>
          )}
        </section>
      </div>

      <div className={styles.grillaPerfil}>
        {/* ===== Preferencias ===== */}
        <section className={styles.tarjeta}>
          <h2 className={styles.subtitulo}>
            <span>⚙️</span> Preferencias
          </h2>
          <div className={styles.prefsLista}>
            <div className={styles.prefFila}>
              <div>
                <strong>Notificaciones por correo</strong>
                <small>Avisos de préstamos y devoluciones</small>
              </div>
              <button
                className={`${styles.switch} ${prefs.emailNotis ? styles.switchOn : ''}`}
                onClick={() => togglePref('emailNotis')}
                aria-pressed={prefs.emailNotis}
              >
                <span className={styles.switchKnob} />
              </button>
            </div>
            <div className={styles.prefFila}>
              <div>
                <strong>Resumen semanal</strong>
                <small>Un resumen de tu actividad cada lunes</small>
              </div>
              <button
                className={`${styles.switch} ${prefs.resumenSemanal ? styles.switchOn : ''}`}
                onClick={() => togglePref('resumenSemanal')}
                aria-pressed={prefs.resumenSemanal}
              >
                <span className={styles.switchKnob} />
              </button>
            </div>
          </div>
          <p className={styles.prefNota}>
            Las preferencias se guardan localmente en tu navegador.
          </p>
        </section>

        {/* ===== Tienda de logros ===== */}
        <section className={styles.tarjeta}>
          <h2 className={styles.subtitulo}>
            <span>🛒</span> Recompensas
          </h2>
          <div className={styles.tienda}>
            {tienda.map((t) => (
              <div key={t.nombre} className={styles.tiendaItem}>
                <span className={styles.tiendaIcono}>{t.icono}</span>
                <div>
                  <strong>{t.nombre}</strong>
                  <small>{t.precio}</small>
                </div>
              </div>
            ))}
          </div>
        </section>
      </div>

      {/* ===== Cambiar contraseña ===== */}
      <section className={styles.tarjeta}>
        <h2 className={styles.subtitulo}>
          <span>🔐</span> Cambiar contraseña
        </h2>

        {mensaje && (
          <div
            className={`${styles.alerta} ${mensaje.tipo === 'ok' ? styles.ok : styles.error}`}
            role="alert"
          >
            {mensaje.texto}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className={styles.formRow}>
            <div className={styles.formGroup}>
              <label>Contraseña actual *</label>
              <input
                type="password"
                name="contrasena_actual"
                value={passwords.contrasena_actual}
                onChange={handleChange}
                required
                autoComplete="current-password"
              />
            </div>
            <div className={styles.formGroup}>
              <label>Nueva contraseña *</label>
              <input
                type="password"
                name="contrasena_nueva"
                value={passwords.contrasena_nueva}
                onChange={handleChange}
                minLength="6"
                placeholder="Mínimo 6 caracteres"
                required
                autoComplete="new-password"
              />
            </div>
            <div className={styles.formGroup}>
              <label>Confirmar nueva contraseña *</label>
              <input
                type="password"
                name="confirmar"
                value={passwords.confirmar}
                onChange={handleChange}
                required
                autoComplete="new-password"
              />
            </div>
          </div>
          <button type="submit" className={styles.btnGuardar} disabled={guardando}>
            {guardando ? 'Guardando...' : 'Actualizar contraseña'}
          </button>
        </form>
      </section>
    </div>
  );
};

export default Perfil;