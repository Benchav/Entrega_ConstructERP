# 🏗️ ConstructERP — API de Constructora

> **Backend:** Node.js · Express · Firebase Firestore
> **Frontend:** React · Vite · TailwindCSS · Shadcn/ui
> **Infraestructura:** Docker · Nginx · docker-compose

API RESTful robusta diseñada para gestionar los recursos y operaciones de una empresa constructora. El proyecto incluye autenticación basada en **JWT con Cookies HttpOnly**, autorización **RBAC** (Role-Based Access Control) con 14 roles, validación de esquemas con **Zod**, sistema de **auditoría automática** y una suite de pruebas automatizadas con **Jest**.

---

## 📋 Características Principales

- **Servidor RESTful**: Operaciones CRUD completas para 13+ entidades (Proyectos, Usuarios, Inventario, Finanzas, Licitaciones, etc.).
- **Base de Datos en la Nube**: Firebase Firestore (NoSQL, escalable, tiempo real).
- **Autenticación Segura**: JWT almacenado en Cookies `HttpOnly` con `SameSite: strict` (inmune a XSS y CSRF).
- **Autorización por Roles (RBAC)**: Middleware que gestiona permisos granulares por rol (`CEO`, `Gerente General`, `Jefe de Obra`, `RRHH`, `Bodeguero`, etc.).
- **Validación de Entradas**: Esquemas estrictos con `Zod` que rechazan payloads maliciosos antes de tocar la base de datos.
- **Auditoría Automática**: Cada mutación (crear, editar, eliminar) registra `createdBy`, `updatedBy` y guarda un log inmutable en la colección `audit_logs` de Firestore.
- **Seguridad HTTP**: `Helmet`, `express-rate-limit`, `cookie-parser`, límite de payload (2MB).
- **Documentación Interactiva**: Swagger UI disponible en `/docs`.
- **Contraseñas Seguras**: Hasheadas con `bcrypt`.
- **Testing**: Suite automatizada con `Jest` y `Supertest`.
- **Dockerizado**: Listo para despliegue con `docker-compose`.

---

## 🛠️ Tecnologías

| Capa | Tecnología |
|------|-----------|
| Backend | Node.js, Express.js |
| Base de Datos | Firebase Firestore (NoSQL) |
| Autenticación | JWT (`jsonwebtoken`), `bcrypt` |
| Validación | Zod |
| Seguridad | Helmet, express-rate-limit, cookie-parser |
| Documentación | swagger-jsdoc, swagger-ui-express |
| Testing | Jest, Supertest |
| Frontend | React 18, Vite, TypeScript, TailwindCSS, Shadcn/ui |
| Infraestructura | Docker, Nginx, docker-compose |

---

## 🚀 Inicio Rápido

### Opción 1: Con Docker (Recomendado)

> **Requisito:** Tener [Docker Desktop](https://www.docker.com/products/docker-desktop/) instalado y corriendo.

```bash
# 1. Clonar ambos repositorios en la misma carpeta raíz
git clone https://github.com/Benchav/Api_Constructora.git
git clone <url-del-frontend> Constructora

# 2. Configurar variables de entorno del backend
cp Api_Constructora/.env.example Api_Constructora/.env
# Editar .env con tus credenciales de Firebase (ver sección de Variables de Entorno)

# 3. Construir y levantar todo el ecosistema
docker-compose build
docker-compose up -d

# 4. ¡Listo! Abrir en el navegador:
#    Frontend:  http://localhost
#    Swagger:   http://localhost/docs
#    API:       http://localhost/api
```

#### Comandos Útiles de Docker

```bash
docker-compose ps               # Ver estado de los contenedores
docker-compose logs -f           # Ver logs en tiempo real
docker-compose logs backend      # Ver logs solo del backend
docker-compose down              # Detener todo
docker-compose build --no-cache  # Reconstruir sin caché
docker-compose exec backend npm test  # Ejecutar tests
```

#### Arquitectura Docker

```
┌─── Docker ──────────────────────────────────────┐
│                                                 │
│  ┌─ constructerp-frontend ─┐  ┌─ constructerp-backend ─┐
│  │  Nginx (:80)            │─▶│  Node.js (:3000)        │──▶ Firebase Cloud
│  │  React SPA              │  │  Express API            │
│  └─────────────────────────┘  └─────────────────────────┘
│         ▲                                               │
└─────────│───────────────────────────────────────────────┘
          │
     http://localhost
```

---

### Opción 2: Sin Docker (Desarrollo Local)

#### Backend

```bash
# 1. Clonar e instalar
git clone https://github.com/Benchav/Api_Constructora.git
cd Api_Constructora
npm install

# 2. Configurar variables de entorno
cp .env.example .env
# Editar .env con tus credenciales de Firebase

# 3. Ejecutar en modo desarrollo
npm run dev

# Servidor disponible en: http://localhost:3000
# Swagger disponible en:  http://localhost:3000/docs
```

#### Frontend

```bash
# 1. Clonar e instalar
git clone <url-del-frontend> Constructora
cd Constructora
npm install

# 2. Ejecutar en modo desarrollo
npm run dev

# Frontend disponible en: http://localhost:8080
```

---

## 🔐 Variables de Entorno

Crea un archivo `.env` en la raíz de `Api_Constructora/` con las siguientes variables:

```env
# JWT
JWT_SECRET=tu_clave_secreta_larga_y_segura
JWT_EXPIRES_IN=7d

# Firebase Admin SDK
FIREBASE_PROJECT_ID=tu-proyecto-firebase
FIREBASE_CLIENT_EMAIL=firebase-adminsdk-xxxxx@tu-proyecto.iam.gserviceaccount.com
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\nTU_CLAVE_PRIVADA\n-----END PRIVATE KEY-----\n"

# CORS (orígenes permitidos, separados por coma)
CORS_ORIGIN=http://localhost,http://localhost:5173,http://localhost:8080,https://tu-frontend.vercel.app

# Entorno
NODE_ENV=production
```

> ⚠️ **Importante:** Nunca subas el archivo `.env` a GitHub. Está incluido en `.gitignore`.

---

## 🧪 Testing

```bash
# Ejecutar toda la suite de pruebas
npm test

# Resultado esperado:
# Test Suites: 3 passed, 3 total
# Tests:       8 passed, 8 total
```

La suite incluye pruebas de:
- **Seguridad**: Cabeceras Helmet, límite de payload (413), Rate Limiting (429).
- **Autenticación**: Cookies HttpOnly, login/logout, protección de token.
- **Servicios**: Operaciones CRUD del GenericService.

---

## 📁 Estructura del Proyecto

```
Api_Constructora/
├── Dockerfile                  # Imagen Docker del backend
├── .dockerignore               # Exclusiones para Docker
├── server.js                   # Punto de entrada del servidor
├── app.js                      # Configuración de Express (middleware, rutas, Swagger)
├── package.json
├── docs/                       # Documentación técnica
│   ├── parches_seguridad.md
│   ├── 03_migracion_backend.md
│   ├── 04_migracion_frontend.md
│   ├── 05_arquitectura_senior.md
│   ├── 06_arquitectura_senior_frontend.md
│   └── 07_dockerizacion.md
├── tests/                      # Suite de pruebas automatizadas
│   ├── auth.test.js
│   ├── security.test.js
│   └── genericService.test.js
└── src/
    ├── config/
    │   └── firebase.js         # Conexión a Firebase Admin SDK
    ├── controllers/
    │   ├── genericController.js # Controlador genérico con auditoría
    │   ├── authController.js    # Login/Logout con Cookies HttpOnly
    │   └── proyectosController.js
    ├── middleware/
    │   ├── authMiddleware.js    # Protección JWT + RBAC (14 roles)
    │   └── validateZod.js      # Middleware de validación con Zod
    ├── models/                  # Schemas de Swagger
    ├── routes/                  # Definición de rutas con autorización
    ├── services/
    │   ├── genericService.js    # CRUD genérico + Audit Logs + Mass Assignment Protection
    │   ├── authService.js
    │   └── usuariosService.js
    ├── utils/
    │   ├── jwt.js
    │   └── idGenerator.js
    └── validations/
        └── proyectoSchema.js   # Schema Zod para validación estricta
```

---

## 📖 Documentación de Seguridad

Toda la documentación técnica de las mejoras de seguridad implementadas se encuentra en la carpeta `docs/`:

| Documento | Contenido |
|-----------|-----------|
| `parches_seguridad.md` | Helmet, Cookies HttpOnly, Rate Limiting, Mass Assignment |
| `03_migracion_backend.md` | Migración de tokens a Cookies HttpOnly (Backend) |
| `04_migracion_frontend.md` | Migración del Frontend (Axios + AuthContext) |
| `05_arquitectura_senior.md` | Validación Zod, Audit Logs, CSRF |
| `06_arquitectura_senior_frontend.md` | Interceptor global de errores, CSP en Vercel |
| `07_dockerizacion.md` | Arquitectura Docker, Nginx, docker-compose |

---

## 👨‍💻 Autor

**Joshua Chávez**
🌐 [Portafolio](https://joshuachavez.vercel.app/)