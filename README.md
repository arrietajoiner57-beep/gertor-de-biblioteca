# Sistema de Biblioteca

Sistema de gestión de biblioteca con **React** (frontend), **Express + Node.js** (backend) y **MySQL/MariaDB** (base de datos), con **autenticación por roles** (administrador / bibliotecario / usuario) validada siempre en el servidor con JWT.

Incluye reportes **PDF/Excel**, notificaciones en **tiempo real** (Socket.IO), **búsqueda en backend**, gráficas de dashboard, y está listo para desplegarse con **Docker Compose** o en local con XAMPP.

---

## Estructura del proyecto

```
├── backend/                 → API REST (Express + mysql2 + JWT)
│   ├── .env                 → Configuración (BD, JWT, admin inicial) — no se sube
│   ├── .env.example         → Modelo de configuración para copiar a .env
│   ├── Dockerfile           → Imagen del backend (node:20-alpine)
│   ├── dockerEntrypoint.js  → Espera la BD, siembra admin y arranca
│   └── src/
│       ├── app.js           → Servidor Express + endpoints de dashboards
│       ├── config/          → db.js (pool MySQL) y socket.js (Socket.IO)
│       ├── middleware/      → verifyToken / requireAdmin / requireBibliotecario
│       ├── models/          → Consultas SQL (usuario, libro, prestamo, detalle)
│       ├── controllers/     → Lógica (auth, usuario, libro, prestamo, reporte)
│       ├── routes/          → Rutas protegidas por rol (+ reporteRoutes)
│       ├── scripts/         → createAdmin, generadores de PDF/textos y descarga
│       │                      de clásicos (los archivos quedan en uploads/)
│       └── utils/           → libroQuery.js (búsqueda reutilizable y testeable)
│   ├── uploads/             → PDFs/textos de libros digitales (NO se versiona)
│   └── test/                → Pruebas unitarias (node --test)
├── frontend/                → Aplicación React (Create React App)
│   ├── Dockerfile           → Multi-etapa: build React → nginx
│   ├── nginx.conf           → Sirve estáticos + proxy /api y /socket.io
│   └── src/
│       ├── context/         → AuthContext, ToastContext, SocketContext
│       ├── components/      → Layout, Table, Modal, Badge, BookCover,
│       │                      ExportButtons, ProtectedRoute, LectorDigital
│       ├── pages/           → Landing, Login, Inicio, Usuarios, Libros,
│       │                      Prestamos, MisPrestamos, Perfil, Registro,
│       │                      LectorLibro, MisLecturas
│       └── services/api.js  → Cliente axios con token automático
├── database/
│   ├── schema.sql           → Creación completa de la BD + datos de prueba
│   └── seed_wow.sql, seed_prestamos.sql, migration_*.sql
├── docker-compose.yml       → MySQL 8 + backend + frontend (nginx)
└── package.json             → Scripts para correr todo desde la raíz
```

## Requisitos

- **Node.js** instalado
- **XAMPP** (o MySQL/MariaDB) corriendo en el puerto 3306 — *o* **Docker** para la puesta en marcha contenerizada

---

## Características destacadas

- **Reportes exportables (PDF y Excel)**: reportes de préstamos, usuarios y libros con
  cabecera institucional, tablas con datos y pie de página (pdfkit + exceljs).
- **Notificaciones en tiempo real (Socket.IO)**: al solicitar un préstamo el personal
  recibe un aviso al instante, y el usuario se entera al aprobar/rechazar/devolver.
- **Búsqueda en backend**: el catálogo se filtra en el servidor por título, autor,
  ISBN, género o editorial (con debounce en la UI).
- **Dashboard con gráficas interactivas** (Recharts): bar chart de préstamos y
  pie chart de distribución de ejemplares.
- **Catálogo con portadas** de libros (Open Library, con fallback elegante).
- **Interfaz moderna y responsive** con estados de carga *skeleton* y *toasts* de
  confirmación/error.
- **Autenticación por roles** (admin / bibliotecario / usuario) validada en el backend.
- **Flujo completo de préstamos**: solicitud del usuario → aprobación/rechazo →
  devolución con control de stock.
- **Control de stock automático** y **detección de vencidos** por fecha.
- **Docker Compose** listo para levantar la app completa con un solo comando.
- **Pruebas unitarias** del backend con el test runner nativo de Node.
- **Lectura digital** integrada: lector a pantalla completa, seguimiento de progreso,
  sección "Mis Lecturas" y **traducción de la lectura a 7 idiomas** con navegación de
  todas las páginas.

---

## Arquitectura

- **Frontend (SPA React)**: se comunica con la API vía Axios. Envía el JWT en cada
  petición. Usa un contexto de autenticación para la sesión y rutas protegidas por rol.
- **Backend (Express)**: API REST con middleware de autenticación/autorización por rol.
  Expone además un servidor **Socket.IO** (en el mismo puerto 4000) para eventos en
  tiempo real sobre préstamos.
- **Base de datos (MySQL)**: modelo relacional `usuario`, `libros`, `prestamo`,
  `detalle_prestamo`. El estado *vencido* se calcula según la fecha de devolución.
- **Despliegue**: en local con XAMPP o, con Docker Compose, un `nginx` que sirve el
  build de React y hace *proxy* de `/api` y `/socket.io` al backend.

---

## Puesta en marcha (local con XAMPP)

1. **Instalar dependencias** (solo la primera vez):
   ```
   npm run install-all
   ```

2. **Configurar el entorno** (solo la primera vez): el archivo `backend/.env` con las
   credenciales de tu MySQL/AJWT no se sube a git. Copia el modelo y edítalo:
   ```
   copy backend\.env.example backend\.env
   ```
   (En Linux/macOS: `cp backend/.env.example backend/.env`)

3. **Iniciar MySQL** desde el panel de XAMPP.

4. **Crear la base de datos** (solo la primera vez):
   ```
   npm run db
   ```

5. **Crear el administrador inicial** (lee `backend/.env`):
   ```
   npm run seed
   ```
   Credenciales por defecto en desarrollo:
   - Correo: `admin@biblioteca.com`
   - Contraseña: `admin123`

   ⚠️ Cámbialas editando `ADMIN_EMAIL` y `ADMIN_CONTRASENA` en `backend/.env` antes del seed.

6. **(Opcional) Datos de demostración** — para un dashboard vivo con portadas, más
   libros y préstamos de ejemplo (activos, pendientes, vencidos y devueltos):
   ```
   npm run db:seed-wow            # Columna portada + catálogo ampliado con portadas
   npm run db:seed-prestamos      # Préstamos de ejemplo (idempotente)
   ```

7. **Levantar backend y frontend juntos**:
   ```
   npm run dev
   ```
   - Frontend: http://localhost:3000
   - Backend (API): http://localhost:4000/api

### Si tu base de datos ya existía antes del login

Aplica las migraciones (agregan columnas sin borrar datos):
```
npm run db:migrate          # contrasena y rol en usuario
npm run db:migrate:roles    # rol bibliotecario
npm run db:migrate:estados  # estado pendiente en prestamo
```

---

## Puesta en marcha (con Docker Compose)

Levanta **MySQL 8 + backend + frontend (nginx)** con datos iniciales incluidos:
```
npm run docker:up
```
- Frontend: http://localhost:3000
- Backend (API): http://localhost:4000/api

Gestión:
```
npm run docker:down     # Detener y eliminar contenedores
npm run docker:logs     # Ver logs en vivo
```

> El primer arranque inicializa la base de datos automáticamente (esquema + migraciones
> + seed de portadas) y crea el administrador por defecto.

---

## Testing del backend

Las pruebas usan el test runner nativo de Node (sin dependencias adicionales):
```
cd backend
npm test
```

Cubren el **middleware de autenticación** (verificación de JWT y permisos por rol) y la
**lógica de búsqueda** de libros.

---

## Roles

| Funcionalidad | Admin | Bibliotecario | Usuario |
|---|---|---|---|
| Ver estadísticas globales | ✅ | ✅ (parcial) | ❌ (solo las suyas) |
| Gestión de usuarios (CRUD + rol) | ✅ | ❌ | ❌ |
| Crear/editar/eliminar libros | ✅ | ✅ | ❌ |
| Ver y buscar libros | ✅ | ✅ | ✅ |
| Registrar/editar/devolver préstamos | ✅ | ✅ | ❌ |
| Solicitar préstamo (será aprobado) | — | — | ✅ |
| Exportar reportes (Excel/PDF) | ✅ | ✅ (préstamos/libros) | ❌ |
| Ver sus propios préstamos | ✅ | ✅ | ✅ |

La autorización se aplica en el **backend** (JWT + middleware), no solo ocultando botones.

---

## Endpoints de la API (principales)

| Método | Ruta | Acceso | Descripción |
|--------|------|--------|-------------|
| POST | /api/auth/login | Público | Iniciar sesión (devuelve token JWT) |
| GET | /api/auth/me | Autenticado | Perfil del usuario actual |
| PUT | /api/auth/password | Autenticado | Cambiar contraseña propia |
| GET | /api/stats | Admin | Estadísticas + actividad reciente |
| GET | /api/stats/bibliotecario | Bibliotecario/admin | Estadísticas para catálogo/préstamos |
| GET | /api/stats/me | Autenticado | Resumen propio del usuario |
| GET/POST | /api/usuarios | Admin | Listar / crear usuarios |
| GET/PUT/DELETE | /api/usuarios/:id | Admin | Leer / editar / eliminar usuario |
| GET | /api/libros?q= | Autenticado | Catálogo con búsqueda por texto |
| POST/PUT/DELETE | /api/libros/:id | Bibliotecario/admin | Crear / editar / eliminar libro |
| GET | /api/libros/:id/lectura | Autenticado | Stream del PDF/EPUB (solo con préstamo activo o suscripción) |
| GET | /api/libros/:id/acceso | Autenticado | ¿Puede leer este libro? (`permitido` + `es_digital`) |
| GET | /api/libros/:id/texto?pagina=N | Autenticado | Texto de una página para la traducción (misma protección) |
| POST | /api/libros/upload | Bibliotecario/admin | Subir PDF/EPUB con conteo automático de páginas |
| GET | /api/lectura/:libroId/progreso | Autenticado | Progreso de lectura del usuario en un libro |
| POST | /api/lectura/:libroId/progreso | Autenticado | Guardar progreso (página, % y minutos) |
| GET | /api/lectura/stats | Autenticado | Minutos, libros completados y racha del usuario |
| GET | /api/lectura/mis-libros | Autenticado | Libros en préstamo con progreso y accesibilidad |
| POST | /api/prestamos/solicitar | Autenticado | Solicitar un préstamo (queda pendiente) |
| GET | /api/prestamos/mis | Autenticado | Préstamos del usuario actual |
| GET | /api/prestamos?estado= | Bibliotecario/admin | Todos los préstamos |
| PUT | /api/prestamos/:id/aprobar | Bibliotecario/admin | Aprobar solicitud pendiente |
| PUT | /api/prestamos/:id/rechazar | Bibliotecario/admin | Rechazar solicitud pendiente |
| PUT | /api/prestamos/:id/devolver | Bibliotecario/admin | Registrar devolución (restaura stock) |
| GET | /api/reportes/:seccion/:formato | Admin | Excel/PDF de préstamos, usuarios o libros |
| GET | /api/health | Público | Estado del servidor y la BD |

---

## Lector digital y traducción

La biblioteca permite **leer libros 100 % digitales** dentro de la misma web. Los libros
marcados como digitales (`es_digital = 1`) tienen un archivo PDF (o EPUB) en `backend/uploads/`
y se abren en un lector a pantalla completa.

### Acceso a la lectura

Para poder leer un libro digital el usuario debe tener **un préstamo activo** o una
**suscripción activa** (el administrador tiene una suscripción de prueba y puede leerlo todo).
El acceso se comprueba siempre en el backend:

- `GET /api/libros/:id/acceso` → indica `permitido` y `es_digital`.
- El stream de lectura y el endpoint de texto devuelven **403** si no hay acceso.

En el catálogo, al pulsar **"Leer"** sin acceso se muestra un aviso con el botón
**"Solicitar préstamo"**. Los libros ya prestados se agrupan en la sección
**"Mis Lecturas"**, desde donde se abre la lectura con un solo clic.

### Mis Lecturas

Página (`/app/mis-lecturas`) que muestra todos los libros que el usuario tiene en préstamo
con:

- Portada, título, autor y procedencia del acceso (préstamo / suscripción).
- Barra de progreso de lectura ("Sin empezar", porcentaje o "Libro completo").
- Botón **"Leer ahora / Continuar leyendo"** según el progreso.
- Fecha de devolución e historial de préstamos anteriores.
- Banner indicando si hay una suscripción activa.

### La traducción de la lectura

Junto a los controles de tema, fuente y tamaño, la barra del lector tiene un botón de
**idioma 🌐** que traduce la lectura a **español, inglés, francés, portugués, alemán,
italiano o ruso**.

- El texto original de cada libro se guarda como `.txt` en `backend/uploads/textos/` y se
  divide en páginas del mismo modo que el PDF (mismo número de páginas).
- Al elegir idioma, la **página en curso** se traduce y se muestra en la interfaz normal de
  lectura (igual que el PDF original), con botones **anterior / siguiente**, indicador
  "Página X de Y" y un campo **"Ir a página"** para recorrer todo el libro traducido.
- Se puede alternar entre **"Ver original" / "Ver traducido"** sin salir de la página.
- La traducción usa el **servicio gratuito de Google Translate** (sin clave API), requiere
  conexión a internet y se guarda en **caché por página** para volver a lectura instantánea.
- Con la traducción activa, la **lectura en voz alta** lee el texto en el idioma elegido.

### Generar los archivos de los libros digitales

Los PDFs y textos **no se versionan** (están en `backend/uploads/`, ignorados por git).
Se regeneran con los scripts de `backend/src/scripts/` (desde la carpeta `backend`):

```
node src/scripts/guardarTextosClasicos.js            # .txt de los 30 clásicos
node src/scripts/descargarClasicos.js                # PDF real de texto (los 30 o __SOLO_ID__)
node src/scripts/descargarClasicos.js 2              # solo el libro con id 2
node src/scripts/generarLibrosDemo.js                # PDFs de demostración
```

Los clásicos (Don Quijote, Crimen y castigo, Drácula, etc.) se descargan de
Project Gutenberg vía gutendex, priorizando el español. Obras modernas con derechos de
autor solo pueden subirse manualmente con `POST /api/libros/upload` desde el editor del libro.

---

## Seguridad

- Contraseñas hasheadas con **bcrypt** (nunca en texto plano).
- Sesiones con **JWT** (expiran en 8 h; configurable con `TOKEN_EXPIRA_EN`).
- El rol se valida **siempre** en el servidor; no se confía en el frontend.
- Los mensajes de error no exponen detalles internos.

---

## Notas

- El backend usa el puerto **4000** (ver `backend/.env`); el frontend, el **3000**.
- Al crear/aprobar un préstamo se descuenta el stock (`cantidad_disponible`); al devolver
  se restaura.
- Un préstamo activo cuya fecha límite pasó se muestra automáticamente como **Vencido**.
- No se puede prestar más que el stock disponible ni eliminar usuarios/préstamos con
  préstamos activos.
- Los **libros digitales** se transmiten por HTTP en modo *stream* (soporta peticiones de
  rango `Range`) y el iframe usa la autenticación por `?token=`, ya que los navegadores no
  envían la cabecera `Authorization` en los iframes.
- Las bases de datos `detalle_prestamo`, `lectura_sesion`, `progreso_lectura` y `resena`
  borran en cascada al eliminar un libro; los préstamos huérfanos deben limpiarse aparte.
