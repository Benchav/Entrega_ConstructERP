# Dockerización del Proyecto ConstructERP
**Fecha:** 26 de Junio de 2026
**Objetivo:** Contenerización completa del ecosistema (Backend + Frontend) para despliegue reproducible y portable.

---

## 1. Arquitectura de Contenedores

El proyecto se compone de **2 servicios Docker** orquestados por `docker-compose`:

| Servicio | Imagen Base | Puerto | Función |
|----------|-------------|--------|---------|
| `backend` | `node:20-alpine` | 3000 | API REST (Express + Firebase) |
| `frontend` | `nginx:stable-alpine` | 80 | Servidor estático (React) + Reverse Proxy |

### Flujo de Red
```
Usuario → :80 (Nginx/Frontend)
                ├── Archivos estáticos (HTML, JS, CSS) → React SPA
                ├── /api/* → proxy_pass → backend:3000
                └── /docs  → proxy_pass → backend:3000 (Swagger)
```

Los contenedores se comunican a través de una red interna Docker (`constructora-net`) tipo `bridge`. El frontend resuelve el nombre `backend` gracias al DNS interno de Docker.

---

## 2. Backend — Dockerfile

### Estrategia: Multi-Stage Build
- **Stage 1 (`deps`):** Instala únicamente las dependencias de producción (`npm ci --omit=dev`). Esto reduce el tamaño de la imagen eliminando `jest`, `nodemon`, `supertest` y demás herramientas de desarrollo.
- **Stage 2 (`runner`):** Copia las dependencias ya instaladas y el código fuente. Ejecuta como un **usuario no-root** (`appuser`) por seguridad.

### Seguridad
- El archivo `.env` **NUNCA** se copia dentro de la imagen (excluido vía `.dockerignore`). Las variables de entorno se inyectan en tiempo de ejecución mediante `env_file` en `docker-compose.yml`.
- Se incluye un `HEALTHCHECK` que verifica cada 30 segundos que el servidor responda en `http://localhost:3000/`.
- El proceso corre como usuario no-root (`UID 1001`), siguiendo el principio de mínimo privilegio.

---

## 3. Frontend — Dockerfile (Multi-Stage)

### Estrategia
- **Stage 1 (`builder`):** Instala todas las dependencias (incluidas `devDependencies` como TypeScript, Vite, TailwindCSS), ejecuta `npm run build` y genera la carpeta `dist/` con los archivos estáticos optimizados.
- **Stage 2 (`runner`):** Usa `nginx:stable-alpine` (~25MB). Solo copia los archivos de `dist/` y la configuración personalizada de Nginx. El resultado es una imagen ultra-ligera sin Node.js, sin `node_modules`, sin código fuente.

### Variable de Entorno Dinámica
En el Dockerfile se define `ENV VITE_API_URL=/api`. Vite lo inyecta en tiempo de compilación, de modo que Axios apunta a `/api` (ruta relativa). Nginx intercepta `/api/*` y hace proxy al backend.

En producción (Vercel), si `VITE_API_URL` no está definida, Axios usa el fallback: `https://api-constructora.vercel.app/api`.

---

## 4. Nginx — Configuración (`nginx.conf`)

### Funciones
1. **Servidor Estático:** Sirve los archivos compilados de React desde `/usr/share/nginx/html`.
2. **Reverse Proxy:** Redirige `/api/*` y `/docs` al contenedor del backend (`http://backend:3000`).
3. **SPA Fallback:** `try_files $uri $uri/ /index.html` garantiza que React Router maneje todas las rutas del lado del cliente.
4. **Cabeceras de Seguridad:** Replica las mismas políticas que teníamos en `vercel.json` (CSP, X-Frame-Options, etc.).
5. **Compresión Gzip:** Reduce el tamaño de las respuestas en ~70%.
6. **Caché de Assets:** Los archivos estáticos (.js, .css, imágenes) se cachean por 1 año con `Cache-Control: public, immutable`.

---

## 5. Docker Compose (`docker-compose.yml`)

Ubicado en `D:\docker-compose.yml` (nivel superior, hermano de ambos proyectos).

### Servicios
- **`backend`:** Construye desde `./Api_Constructora`, inyecta `.env`, expone `:3000`.
- **`frontend`:** Construye desde `./Constructora`, depende de `backend`, expone `:80`.

### Política de Reinicio
Ambos servicios usan `restart: unless-stopped`, lo que garantiza que se reinicien automáticamente si el proceso muere, pero no se reinicien si los detenemos manualmente.

---

## 6. Comandos de Uso

### Construir y Levantar
```bash
cd D:\
docker-compose build            # Construir ambas imágenes
docker-compose up -d            # Levantar en segundo plano
```

### Monitoreo
```bash
docker-compose ps               # Ver estado de los contenedores
docker-compose logs -f          # Ver logs en tiempo real
docker-compose logs backend     # Ver logs solo del backend
docker-compose logs frontend    # Ver logs solo del frontend
```

### Mantenimiento
```bash
docker-compose down             # Detener y eliminar contenedores
docker-compose build --no-cache # Reconstruir sin caché (tras cambios)
docker-compose restart backend  # Reiniciar solo el backend
```

### Ejecutar Tests dentro del Contenedor
```bash
docker-compose exec backend npm test
```

---

## 7. Variables de Entorno Requeridas

El archivo `.env` del backend (`D:\Api_Constructora\.env`) debe contener:

| Variable | Descripción | Requerida |
|----------|-------------|-----------|
| `JWT_SECRET` | Clave secreta para firmar tokens JWT | ✅ |
| `JWT_EXPIRES_IN` | Tiempo de expiración del JWT (ej: `7d`) | ✅ |
| `FIREBASE_PROJECT_ID` | ID del proyecto en Firebase | ✅ |
| `FIREBASE_CLIENT_EMAIL` | Email de la cuenta de servicio | ✅ |
| `FIREBASE_PRIVATE_KEY` | Clave privada RSA (entre comillas) | ✅ |
| `CORS_ORIGIN` | Orígenes permitidos, separados por coma | ✅ |
| `NODE_ENV` | Entorno (`production` / `development`) | Opcional |

> **Nota:** Para Docker, agregar `http://localhost` a `CORS_ORIGIN` si no está presente.
