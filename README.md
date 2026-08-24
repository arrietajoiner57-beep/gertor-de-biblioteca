# Sistema de Biblioteca

Sistema de gestión de biblioteca con **React** (frontend), **Express + Node.js** (backend) y **MySQL** (base de datos, vía XAMPP), con autenticación por roles (administrador / usuario).

## Estructura del proyecto

```
poryecto react/
├── backend/              → API REST (Express + mysql2 + JWT)
│   ├── .env              → Configuración (BD, JWT, admin inicial)
│   └── src/
│       ├── app.js        → Servidor Express y endpoints de dashboards
│       ├── config/       → Conexión a la base de datos
│       ├── middleware/   → verifyToken / requireAdmin
│       ├── models/       → Consultas SQL
│       ├── controllers/  → Lógica (auth, usuarios, libros, préstamos)
│       ├── routes/       → Rutas de la API protegidas por rol
│       └── scripts/      → createAdmin.js (seed del administrador)
├── frontend/             → Aplicación React (Create React App)
│   └── src/
│       ├── context/      → AuthContext (sesión y rol)
│       ├── components/   → Layout, Table, Modal, Badge, ProtectedRoute
│       ├── pages/        → Login, Dashboard, Usuarios, Libros,
│       │                    Préstamos, Mis Préstamos, Perfil
│       └── services/api.js → Cliente axios con token automático
├── database/
│   ├── schema.sql        → Creación completa de la BD + datos de prueba
│   └── migration_auth.sql → Migración: agrega contrasena y rol a usuario
└── package.json          → Scripts para correr todo desde la raíz
```

## Requisitos

- Node.js instalado
- XAMPP (o MySQL) corriendo en el puerto 3306

## Puesta en marcha

1. **Instalar dependencias** (solo la primera vez):
   ```
   npm run install-all
   ```

2. **Iniciar MySQL** desde el panel de XAMPP.

3. **Crear la base de datos** (solo la primera vez):
   ```
   npm run db
   ```

4. **Crear el administrador inicial** (lee `backend/.env`):
   ```
   npm run seed
   ```
   Credenciales por defecto en desarrollo:
   - Correo: `admin@biblioteca.com`
   - Contraseña: `admin123`
   
   ⚠️ Cámbialas editando `ADMIN_EMAIL` y `ADMIN_CONTRASENA` en `backend/.env` antes del seed.

5. **Levantar backend y frontend juntos**:
   ```
   npm run dev
   ```
   - Frontend: http://localhost:3000
   - Backend (API): http://localhost:4000/api

### Si tu base de datos ya existía antes del login

Aplica la migración (agrega las columnas `contrasena` y `rol` sin borrar datos):
```
npm run db:migrate
```
Los usuarios existentes quedan con la contraseña por defecto `biblioteca123`.

## Roles

| Funcionalidad | Administrador | Usuario |
|---|---|---|
| Ver estadísticas globales | ✅ | ❌ (solo las suyas) |
| Gestión de usuarios (CRUD + rol) | ✅ | ❌ |
| Crear/editar/eliminar libros | ✅ | ❌ |
| Ver y buscar libros | ✅ | ✅ |
| Registrar/editar/devolver préstamos | ✅ | ❌ |
| Ver sus propios préstamos | ✅ | ✅ |
| Cambiar su contraseña | ✅ | ✅ |

La autorización se aplica en el backend (JWT + middleware), no solo ocultando botones.

## Endpoints de la API

| Método | Ruta | Acceso | Descripción |
|--------|------|--------|-------------|
| POST | /api/auth/login | Público | Iniciar sesión (devuelve token JWT) |
| GET | /api/auth/me | Autenticado | Perfil del usuario actual |
| PUT | /api/auth/password | Autenticado | Cambiar contraseña propia |
| GET | /api/stats | Admin | Estadísticas completas + actividad reciente |
| GET | /api/stats/me | Autenticado | Resumen propio para el dashboard |
| GET/POST | /api/usuarios | Admin | Listar / crear usuarios |
| GET/PUT/DELETE | /api/usuarios/:id | Admin | Leer / editar / eliminar usuario |
| GET | /api/libros | Autenticado | Catálogo de libros |
| POST/PUT/DELETE | /api/libros/:id | Admin | Crear / editar / eliminar libro |
| GET | /api/prestamos?estado= | Admin | Todos los préstamos (activo/vencido/devuelto) |
| GET | /api/prestamos/mis | Autenticado | Solo los préstamos del usuario actual |
| POST | /api/prestamos | Admin | Registrar préstamo (descuenta stock) |
| PUT | /api/prestamos/:id | Admin | Editar fechas de un préstamo activo |
| PUT | /api/prestamos/:id/devolver | Admin | Registrar devolución (restaura stock) |
| DELETE | /api/prestamos/:id | Admin | Eliminar préstamo devuelto |
| GET | /api/health | Público | Estado del servidor y la BD |

## Seguridad

- Contraseñas hasheadas con bcrypt (nunca en texto plano).
- Sesiones con JWT (expiran en 8 h; configurable en `.env` con `TOKEN_EXPIRA_EN`).
- El rol se valida siempre en el servidor; nunca se confía en el frontend.
- Los mensajes de error no exponen detalles internos.

## Notas

- El backend usa el puerto **4000** (ver `backend/.env`).
- Al crear un préstamo se descuenta el stock (`cantidad_disponible`); al devolverlo se restaura.
- Un préstamo activo cuya fecha límite ya pasó se muestra automáticamente como **Vencido**.
- No se puede prestar más cantidad que el stock disponible ni eliminar usuarios/préstamos con préstamos activos.
