# Especificación de Requerimientos de Software (SRS) — Gestor de Biblioteca

| Campo | Detalle |
|---|---|
| **Nombre del sistema** | Gestor de Biblioteca |
| **Referencia de documento** | SRS-GB-001 |
| **Estándar de referencia** | IEEE 830 (Software Requirements Specification) |
| **Versión** | 1.0 |
| **Fecha** | 07/09/2026 |
| **Estado** | Aprobado — versión final |
| **Tipo de producto** | Aplicación web (SPA) |

---

## 1. Introducción

### 1.1 Propósito

El presente documento define la especificación de requerimientos del sistema **Gestor de Biblioteca**, una plataforma web accesible e inclusiva orientada a la gestión integral del catálogo, los préstamos, la comunidad de lectores y la asistencia virtual mediante un chatbot ("Bibliotecario Virtual"). Describe los requerimientos funcionales y no funcionales, así como las reglas de negocio implementadas en la versión final del producto.

### 1.2 Alcance

El sistema cubre:

- Portal público de bienvenida (pre-login) con información institucional y catálogo destacado.
- Autenticación por roles (administrador, bibliotecario, usuario) validada en el servidor.
- Gestión de catálogo con búsqueda, galería y ficha ampliada de cada libro.
- Flujo completo de préstamos: solicitud, aprobación/rechazo, devolución y control de stock.
- Módulo de comunidad con reseñas, calificaciones y buzón de sugerencias con votación.
- Asistente virtual conversacional con restricciones de dominio (guardrails).
- Reportes exportables (PDF/Excel) y notificaciones en tiempo real (Socket.IO).

### 1.3 Definiciones, acrónimos y abreviaturas

| Término | Definición |
|---|---|
| **SRS** | Software Requirements Specification (Especificación de Requerimientos de Software). |
| **RF** | Requerimiento Funcional. |
| **RNF** | Requerimiento No Funcional. |
| **RN** | Regla de Negocio. |
| **SPA** | Single Page Application (aplicación de una sola página). |
| **JWT** | JSON Web Token (mecanismo de autenticación). |
| **Guardrail** | Filtro de contenido que restringe las respuestas del chatbot a un dominio temático. |
| **Lightbox** | Modal a pantalla completa/vista ampliada que se abre sobre el contenido actual. |
| **Upvote** | Voto positivo de un usuario sobre una sugerencia. |
| **Stock** | Cantidad de ejemplares disponibles de un título. |

### 1.4 Referencias

- `README.md` del proyecto (arquitectura, puesta en marcha y tabla de roles).
- `database/schema.sql` y migraciones (`database/migration_*.sql`).
- Código fuente del frontend (`frontend/src/pages`, `frontend/src/components`, `frontend/src/services`).
- Código fuente del backend (`backend/src/routes`, `backend/src/controllers`, `backend/src/models`).

---

## 2. Descripción General

### 2.1 Perspectiva del producto

El **Gestor de Biblioteca** es una aplicación web de arquitectura cliente-servidor:

- **Frontend**: SPA construida con React (Create React App), con tipografías y paleta visual cálida.
- **Backend**: API REST con Express + Node.js, autenticación JWT con bcrypt y permisos por rol.
- **Base de datos**: MySQL/MariaDB con modelo relacional (usuarios, libros, préstamos, detalles).
- **Tiempo real**: notificaciones vía Socket.IO (solicitud, aprobación, rechazo y devolución).
- **Despliegue**: local (XAMPP) o contenerizado (Docker Compose con nginx como servidor estático y proxy).

### 2.2 Funciones del sistema

1. Portal público de bienvenida con horarios, reglamento, ubicación y libros destacados.
2. Autenticación y autorización por roles con rutas protegidas.
3. Navegación interna con las secciones: **Inicio, Usuarios, Libros, Préstamos, Mis Préstamos, Comunidad y Perfil**.
4. Catálogo con tarjetas 3D, búsqueda en el servidor y **Modal Lightbox** de vista ampliada.
5. Gestión manual de préstamos con validación estricta de fechas.
6. Comunidad: reseñas con estrellas, comentarios, y buzón de sugerencias votable.
7. Asistente virtual flotante con respuestas restringidas al dominio bibliotecario.

### 2.3 Características de los usuarios

| Rol | Descripción |
|---|---|
| **Administrador** | Control total: gestión de usuarios (CRUD y asignación de rol), libros, préstamos, reportes (PDF/Excel) y estadísticas globales. |
| **Bibliotecario** | Gestión de catálogo y préstamos manuales, reportes de préstamos/libros y estadísticas parciales. |
| **Usuario/lector** | Explora el catálogo, solicita préstamos (quedan pendientes de aprobación), consulta sus propios préstamos, publica reseñas y sugerencias y usa el chatbot. |
| **Visitante (sin cuenta)** | Accede únicamente al portal público de bienvenida y al catálogo destacado mostrado en él. |

### 2.4 Restricciones, supuestos y dependencias

- La autorización se valida **siempre en el servidor**; el frontend no es fuente de confianza.
- El vuelco de stock se descuenta al aprobar un préstamo y se restaura al devolver.
- Un préstamo activo cuya fecha límite haya pasado se muestra automáticamente como **Vencido**.
- El catálogo del chatbot se enriquece con una ficha curatorial demo cuando un título no existe en la base de datos.
- Se asume conexión con el backend para la obtención del catálogo en tiempo real; en ausencia de conexión, la interfaz degrada con datos de demostración.

### 2.5 Arquitectura tecnológica

| Capa | Tecnología | Responsabilidad |
|---|---|---|
| Presentación | React (CRA), CSS Modules, Recharts | UI, navegación, estados de carga y animaciones. |
| Aplicación | Express + Node.js | API REST, autenticación, autorización por rol, Socket.IO. |
| Datos | MySQL/MariaDB | Persistencia de usuarios, libros, préstamos y comunidad. |
| Distribución | Docker Compose / nginx | Compilación estática del frontend y proxy de `/api` y `/socket.io`. |

---

## 3. Requerimientos Funcionales (RF)

### RF-01 — Portal Público / Pre-Login

| Atributo | Detalle |
|---|---|
| **Descripción** | Sin autenticación, el sistema debe desplegar un portal de bienvenida institucional con información pública. |
| **Detalle funcional** | - Horarios de atención (lunes a viernes, sábados y actividades de domingo).<br>- Ubicación y accesos de la sede.<br>- Reglamento y normas básicas de préstamo.<br>- Catálogo de libros destacados con el cual el visitante puede interactuar visualmente. |
| **Criterios de aceptación** | Un visitante no autenticado puede ingresar la URL raíz y visualizar la información institucional y los libros destacados sin redireccionamiento forzoso ni mensajes de error. |

### RF-02 — Navegación e Interfaz

| Atributo | Detalle |
|---|---|
| **Descripción** | El menú principal debe estructurar la aplicación post-login en secciones claras y accesibles. |
| **Detalle funcional** | - Menú principal con las secciones: **Inicio, Usuarios, Libros, Préstamos, Mis Préstamos, Comunidad y Perfil**.<br>- La sección originalmente denominada *Dashboard* se presenta como **Inicio**.<br>- Menú contextual según rol: la gestión de usuarios es exclusiva de administradores; la gestión de préstamos y libros es del personal.<br>- Navegación rápida adicional (command palette) y dock flotante con accesos directos. |
| **Criterios de aceptación** | Cada rol ve únicamente las secciones que le corresponden; la navegación es consistente en escritorio y móvil. |

### RF-03 — Catálogo y Vista Ampliada (Modal Lightbox)

| Atributo | Detalle |
|---|---|
| **Descripción** | El catálogo debe mostrar tarjetas de libros con estética realista (sombra 3D) y abrir una vista ampliada al seleccionar la portada. |
| **Detalle funcional** | - Tarjetas de libro con portada, título, autor, género y disponibilidad, con sombra tridimensional y estados de carga *skeleton*.<br>- Búsqueda en el servidor por título, autor, ISBN, género o editorial (con *debounce*).<br>- **Modal Lightbox "Vista Ampliada del Libro"**: portada en alta resolución a la izquierda; a la derecha, título, autor, resumen completo, ficha técnica (**ISBN, Editorial, Año, Páginas**), disponibilidad de ejemplares y el botón **"Solicitar Préstamo"**.<br>- Fallback elegante de portadas (Open Library) con marcador de posición con inicial del título. |
| **Criterios de aceptación** | Al presionar cualquier portada se abre el modal ampliado con la ficha técnica completa y el estado de disponibilidad; el formulario de solicitud valida los campos antes de confirmar. |

### RF-04 — Gestión de Préstamos y Validaciones

| Atributo | Detalle |
|---|---|
| **Descripción** | El registro manual de préstamos (Administrador/Bibliotecario) debe restringir las fechas a partir del día actual y validar los campos antes de confirmar. |
| **Detalle funcional** | - Selectores de fecha con `min = fecha_actual`, impidiendo seleccionar o escribir cualquier fecha anterior al día de hoy.<br>- Validaciones dinámicas: fecha de préstamo anterior a hoy, fecha de devolución anterior a hoy y devolución anterior a la fecha de préstamo.<br>- Botón de envío deshabilitado hasta que todas las fechas sean válidas.<br>- Fecha de devolución sugerida automáticamente a +14 días desde la fecha de préstamo, recalculada al cambiar la fecha de inicio.<br>- En edición de préstamos existentes, las fechas ya registradas permanecen válidas; solo se bloquea un cambio manual a una fecha pasada.<br>- Control automático de stock y de ejemplares vencidos. |
| **Criterios de aceptación** | No es posible registrar un préstamo manual con fechas pasadas; el sistema muestra el error correspondiente y bloquea el envío hasta corregirlo. |

### RF-05 — Módulo de Comunidad (Reseñas)

| Atributo | Detalle |
|---|---|
| **Descripción** | Los usuarios autenticados deben poder valorar libros con calificaciones de 1 a 5 estrellas y dejar comentarios. |
| **Detalle funcional** | - Selector visual de 1 a 5 estrellas con validación obligatoria (mínimo 1).<br>- Reseñas con texto de comentario asociado a un libro.<br>- Pantalla consolidada de comunidad donde se listan las reseñas y los libros valorados.<br>- Los usuarios no pueden duplicar o enviciar su valoración sobre el mismo libro (validación en backend). |
| **Criterios de aceptación** | Un usuario autenticado publica una reseña (estrellas + comentario) y esta se muestra de inmediato en la sección Comunidad; el sistema rechaza reseñas sin calificación. |

### RF-06 — Buzón de Sugerencias

| Atributo | Detalle |
|---|---|
| **Descripción** | El sistema debe permitir solicitar títulos no existentes y dar visibilidad al interés colectivo mediante votación pública. |
| **Detalle funcional** | - Formulario de sugerencia de título (autor y motivación opcionales).<br>- **Votación pública (upvote)**: cada usuario vota una vez por sugerencia; no puede votar sus propias sugerencias.<br>- Ordenamiento por número de votos y conteo global.<br>- **Badges de estado** administrados por el personal: *En Revisión*, *Aprobado / En Adquisición* y *¡Ya en Biblioteca!*.<br>- Indicación de voto propio (botón activo) y estados accesibles. |
| **Criterios de aceptación** | Un usuario autenticado crea una sugerencia (estado inicial *En Revisión*), otros usuarios pueden votarla una vez, y el personal puede cambiar su estado a *Aprobado* o *¡Ya en Biblioteca!*. |

### RF-07 — Asistente Virtual con IA (Chatbot "Bibliotecario Virtual")

| Atributo | Detalle |
|---|---|
| **Descripción** | El sistema debe incluir un widget flotante conversacional que responda en lenguaje natural sobre el dominio de la biblioteca. |
| **Detalle funcional** | - Widget flotante en la esquina inferior derecha, disponible en todas las páginas autenticadas.<br>- Botones de acceso rápido: *Resumen de un libro*, *Recomiéndame una lectura* y *Horarios*.<br>- Capacidades: resúmenes y sinopsis del catálogo, **resúmenes adaptados por edad** (versión simplificada para niños o por edad ≤ 12 años), recomendaciones por **edad, género y estado de ánimo** (feliz, triste, estresado, aburrido, inspirado, curioso, etc.), y consulta de **disponibilidad en tiempo real**.<br>- **Tarjeta interactiva** dentro del chat: portada, título, autor, género, calificación, disponibilidad y botón directo **"Solicitar Préstamo"**, con confirmación en el chat y notificación.<br>- Guardrails de contenido: respuestas limitadas a temas bibliotecarios y literarios; ante preguntas ajenas responde con un mensaje amable y acotado al dominio.<br>- Títulos de demostración identificados como *Ejemplo* para no permitir solicitudes ficticias. |
| **Criterios de aceptación** | Ante consultas de catálogo, el chatbot responde coherentemente y renderiza la tarjeta del libro cuando corresponde; ante preguntas fuera del dominio, responde únicamente con el mensaje de restricción establecido. |

---

## 4. Requerimientos No Funcionales (RNF)

### RNF-01 — Accesibilidad e Inclusividad

- Tipografía serif para encabezados y sans-serif para el cuerpo, con cuerpos de texto legibles (a partir de 16 px).
- Alto contraste cromático entre texto y fondo (texto caoba oscuro sobre fondo crema/papel).
- Botones y controles de tamaño amplio, con estados de foco visibles, *hover* y mensajes por voz/atributos descriptivos (`aria-label`, `role="alert"`).
- Apto para niños y adultos mayores, sin depender del color como único medio de comunicación.

### RNF-02 — Usabilidad y Rendimiento

- Carga rápida de las tarjetas del catálogo con estados de carga *skeleton* y búsqueda con *debounce* (sin bloqueo de la interfaz).
- Transiciones y animaciones fluidas (modales, notificaciones *toast*, chats) ejecutadas por CSS/JS sin bloquear el hilo de la UI.
- Retroalimentación inmediata (toasts de éxito/error) en todas las operaciones de escritura.
- Búsqueda de catálogo delegada al backend para no transportar toda la colección al cliente.

### RNF-03 — Seguridad de Dominio (IA)

- El chatbot aplica filtros o **guardrails** de contenido para responder exclusivamente sobre temas literarios y administrativos del sistema (catálogo, préstamos, normas, horarios, comunidad).
- Ante temas ajenos (deporte, noticias, clima, política, cocina, etc.), responde con un mensaje predefinido y amable, redirigiendo al dominio bibliotecario.
- No se exponen datos personales de terceros ni información fuera del alcance del sistema.

### RNF-04 — Diseño Adaptativo / Responsive

- La interfaz debe ser compatible con dispositivos móviles, tabletas y monitores de escritorio.
- El menú, la galería, los modales y el widget del chatbot se adaptan mediante *media queries* y composición de componentes responsive.
- La ventana del chat y las tarjetas de libros mantienen legibilidad y usabilidad en pantallas pequeñas.

### RNF-05 — Seguridad y Autenticación

- Contraseñas almacenadas con **bcrypt** (nunca en texto plano).
- Sesiones mediante **JWT** con expiración configurable (8 h por defecto).
- Rol validado siempre en el servidor (middleware `requireAdmin` / `requireBibliotecario` / `verifyToken`).
- Los mensajes de error no exponen detalles internos del sistema.

### RNF-06 — Compatibilidad y Despliegue

- Aplicación desplegable en local (XAMPP) o contenerizada (Docker Compose).
- Frontend servido como estático con proxy de `/api` y `/socket.io` al backend.
- Pruebas unitarias del backend (runner nativo de Node) para middleware de autenticación y lógica de búsqueda.

---

## 5. Reglas de Negocio (RN)

| ID | Regla de Negocio |
|---|---|
| **RN-01** | Ningún préstamo manual puede registrarse con una fecha de inicio o devolución anterior al día en curso (`min = fecha_actual`). |
| **RN-02** | Los usuarios deben contar con una cuenta activa y autenticada para realizar reservaciones de libros, publicar reseñas o crear/votar sugerencias. |
| **RN-03** | El plazo estándar de préstamo es de 14 días, con posibilidad de renovación (1 vez) y hasta 5 ejemplares simultáneos por usuario. |
| **RN-04** | Al aprobar una solicitud de préstamo se descuenta el stock disponible; al registrar la devolución se restaura. |
| **RN-05** | No se puede prestar una cantidad mayor al stock disponible del título. |
| **RN-06** | Un préstamo activo cuya fecha límite haya pasado se presenta automáticamente como **Vencido**. |
| **RN-07** | No se puede eliminar un usuario o un préstamo que tenga préstamos activos. |
| **RN-08** | El usuario no puede votar por su propia sugerencia y solo puede votar una vez por cada sugerencia. |
| **RN-09** | El catálogo del chatbot se enriquece con una ficha curatorial de demostración; los títulos de demostración no generan solicitudes de préstamo reales. |

---

## 6. Matriz de Trazabilidad

| Requerimiento | Módulo / Componente | Archivos fuente de referencia |
|---|---|---|
| RF-01 | Landing / Portal Público | `frontend/src/pages/Landing/` |
| RF-02 | Layout y Navegación | `frontend/src/components/Layout/`, `frontend/src/components/FloatingDock/` |
| RF-03 | Catálogo, búsqueda y Modal Lightbox | `frontend/src/pages/Libros/Libros.js`, `frontend/src/components/Modal/`, `frontend/src/components/BookCover/` |
| RF-04 | Gestión de préstamos y validaciones | `frontend/src/pages/Prestamos/Prestamos.js`, `backend/src/routes/prestamoRoutes.js` |
| RF-05 | Comunidad — reseñas | `frontend/src/pages/Comunidad/Comunidad.js`, `backend/src/routes/` (reseñas) |
| RF-06 | Comunidad — buzón de sugerencias | `frontend/src/pages/Comunidad/Comunidad.js`, `backend/src/` (sugerencias) |
| RF-07 | Asistente Virtual | `frontend/src/services/asistente.js`, `frontend/src/components/AsistenteBiblioteca/` |
| RNF-01 | Estilos globales | `frontend/src/styles/theme.css` |
| RNF-02 | Componentes de carga y notificaciones | `frontend/src/components/Table/`, `frontend/src/context/ToastContext.jsx` |
| RNF-03 | Motor del chatbot (guardrails) | `frontend/src/services/asistente.js` |
| RNF-04 | Hojas de estilo módulares | `*.module.css` de cada página/componente |
| RNF-05 | Autenticación y autorización | `backend/src/middleware/`, `frontend/src/context/AuthContext.jsx` |
| RNF-06 | Paquetes de despliegue | `docker-compose.yml`, `frontend/nginx.conf`, `frontend/Dockerfile` |

---

## 7. Anexo — Resumen Visual del Estilo

- **Fondo**: crema / papel pergamino `#FBF9F5` (variante profunda `#F2ECDF`).
- **Contenedores**: blanco puro `#FFFFFF` con sombras cálidas paralelas para volumen físico.
- **Acentos estructurales**: caoba / madera cálida `#3D2314`.
- **Acentos funcionales**: verde esmeralda `#15803D` (disponibilidad, éxito), dorado `#D97706` (valoraciones), rojo `#DC2626` (errores).
- **Tipografía**: `Playfair Display` / `Merriweather` (serif) para encabezados; `Plus Jakarta Sans` para el cuerpo.
- **Radios y sombras**: esquinas suavizadas (10–24 px) y jerarquía de sombras (`--shadow-sm` a `--shadow-book`) que imitan libros físicos.