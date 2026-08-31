# Notas Docker - Continuar tras reinicio

## Estado al reiniciar (Windows 10 Pro 22H2, arrie)
- Se habilitaron las características `Microsoft-Windows-Subsystem-Linux` y `VirtualMachinePlatform`.
- RestartNeeded: True (requiere reinicio, ya hecho).
- Virtualización habilitada en firmware (Sí).
- Docker NO instalado aún. winget v1.29.290 disponible.

## Siguientes pasos (tras reiniciar y reabrir el proyecto)
1. Confirmar que `wsl --status` y `wsl --version` funcionan.
2. Instalar/actualizar kernel WSL2:
   - `wsl --update`
   - `wsl --set-default-version 2`
3. Instalar Docker Desktop (aparecerán prompts UAC):
   - `winget install -e --id Docker.DockerDesktop`  (o Docker.DockerDesktop.Dev)
4. Arrancar Docker Desktop y esperar a que el motor esté listo:
   - `& "C:\Program Files\Docker\Docker\Docker Desktop.exe"`
   - Esperar: `docker info`
5. Validar el stack de la biblioteca:
   - `docker compose build`
   - `docker compose up -d`
   - Verificar contenedores: `docker compose ps`
   - Probar endpoint: backend en :4000, frontend en http://localhost:3000
6. Comprobar initdb.d (schema + migración pendiente + seed_wow) y login:
   - admin@biblioteca.com / admin123

## Datos del stack (docker-compose.yml)
- db: mysql:8.0, puerto 3307:3306, DB=biblioteca, rootpass123
- backend: puerto 4000, usa DB_HOST=db
- frontend: nginx, puerto 3000:80, proxy /api y /socket.io al backend
- Scripts raíz: `docker:up`, `docker:down`, `docker:logs`

## Nota
Docker Compose no se pudo validar antes del reinicio por falta de Docker.
Tras este proceso la verificación del Bloque 2 quedará completa.
