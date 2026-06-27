# Guia de Solucion de Vulnerabilidades - API Constructora

Fecha: 27/3/2026
Basado en: seguridad.md

## Objetivo
Este documento explica como corregir cada vulnerabilidad detectada, con fragmentos de codigo y el punto exacto donde aplicarlos.

## 0) Dependencias recomendadas
Instalar primero:

    npm install helmet express-rate-limit joi

Opcional para logs:

    npm install pino-http pino-pretty

---

## 1) Corregir secreto JWT inseguro (critico)

### Donde aplicar
- Archivo: src/middleware/authMiddleware.js
- Archivo: src/utils/jwt.js
- Punto exacto: reemplazar la declaracion de SECRET con validacion estricta de variable de entorno.

### Fragmento de codigo (authMiddleware.js)

    const jwt = require('jsonwebtoken');
    const usuariosService = require('../services/usuariosService');

    const SECRET = process.env.JWT_SECRET;
    if (!SECRET || SECRET.length < 32) {
      throw new Error('JWT_SECRET es obligatorio y debe tener al menos 32 caracteres.');
    }

### Fragmento de codigo (utils/jwt.js)

    const jwt = require('jsonwebtoken');

    const SECRET = process.env.JWT_SECRET;
    const EXPIRES_IN = process.env.JWT_EXPIRES_IN || '8h';

    if (!SECRET || SECRET.length < 32) {
      throw new Error('JWT_SECRET es obligatorio y debe tener al menos 32 caracteres.');
    }

    function signToken(payload) {
      return jwt.sign(payload, SECRET, { expiresIn: EXPIRES_IN });
    }

    function verifyToken(token) {
      return jwt.verify(token, SECRET);
    }

    module.exports = { signToken, verifyToken };

---

## 2) Evitar token por query string o headers ambiguos (alta)

### Donde aplicar
- Archivo: src/middleware/authMiddleware.js
- Punto exacto: reemplazar la funcion extractTokenFromReq.

### Fragmento de codigo

    function extractTokenFromReq(req) {
      const authHeader = req.headers.authorization || '';
      if (!authHeader.startsWith('Bearer ')) return null;
      return authHeader.slice(7).trim();
    }

Con esto solo se acepta Authorization Bearer, reduciendo fuga de tokens en URL/logs.

---

## 3) Mitigar mass assignment (critico)

### Donde aplicar
- Archivo: src/controllers/genericController.js
- Punto exacto: antes de service.create(req.body) y service.update(req.params.id, req.body).
- Archivo nuevo sugerido: src/utils/pickAllowedFields.js

### Fragmento utilitario

    function pickAllowedFields(payload, allowedFields) {
      const clean = {};
      for (const key of allowedFields) {
        if (Object.prototype.hasOwnProperty.call(payload, key)) {
          clean[key] = payload[key];
        }
      }
      return clean;
    }

    module.exports = { pickAllowedFields };

### Uso en controlador (ejemplo para usuarios)

    const { pickAllowedFields } = require('../utils/pickAllowedFields');

    const allowedCreate = ['nombre', 'rol', 'username', 'password', 'proyectoAsignadoId'];
    const allowedUpdate = ['nombre', 'username', 'password', 'proyectoAsignadoId'];

    // En create
    const safeBody = pickAllowedFields(req.body, allowedCreate);
    const newItem = await service.create(safeBody);

    // En update
    const safeUpdate = pickAllowedFields(req.body, allowedUpdate);
    const updatedItem = await service.update(req.params.id, safeUpdate);

Nota: para usuarios, normalmente no debes permitir actualizar rol desde endpoints generales.

---

## 4) Agregar validacion robusta por esquema (media-alta)

### Donde aplicar
- Archivo sugerido: src/validators/usuarioValidator.js
- Archivo: src/controllers/usuariosController.js
- Punto exacto: antes de llamar al create/update del servicio.

### Fragmento de esquema con Joi

    const Joi = require('joi');

    const usuarioCreateSchema = Joi.object({
      nombre: Joi.string().min(3).max(80).required(),
      rol: Joi.string().min(2).max(60).required(),
      username: Joi.string().alphanum().min(3).max(30).required(),
      password: Joi.string().min(10).max(128).required(),
      proyectoAsignadoId: Joi.number().integer().allow(null)
    }).unknown(false);

    module.exports = { usuarioCreateSchema };

### Uso en controlador

    const { usuarioCreateSchema } = require('../validators/usuarioValidator');

    const { error, value } = usuarioCreateSchema.validate(req.body);
    if (error) {
      return res.status(400).json({ message: 'Payload invalido', detail: error.message });
    }

    const newItem = await usuariosService.create(value);

---

## 5) Endurecer CORS (alta)

### Donde aplicar
- Archivo: app.js
- Punto exacto: reemplazar app.use(cors())

### Fragmento de codigo

    const cors = require('cors');

    const allowedOrigins = (process.env.CORS_ORIGINS || '')
      .split(',')
      .map(o => o.trim())
      .filter(Boolean);

    app.use(cors({
      origin: function (origin, callback) {
        if (!origin) return callback(null, true);
        if (allowedOrigins.includes(origin)) return callback(null, true);
        return callback(new Error('Origin no permitido por CORS'));
      },
      methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE'],
      allowedHeaders: ['Authorization', 'Content-Type'],
      credentials: false
    }));

### Variable de entorno ejemplo

    CORS_ORIGINS=https://rikiconstructora.vercel.app/

---

## 6) Agregar rate limiting global y en login (alta)

### Donde aplicar
- Archivo: app.js (rate limit global)
- Archivo: src/routes/auth.js (rate limit estricto en /login)

### Fragmento global (app.js)

    const rateLimit = require('express-rate-limit');

    const globalLimiter = rateLimit({
      windowMs: 15 * 60 * 1000,
      max: 300,
      standardHeaders: true,
      legacyHeaders: false,
      message: { message: 'Demasiadas solicitudes. Intenta mas tarde.' }
    });

    app.use(globalLimiter);

### Fragmento para login (auth.js)

    const rateLimit = require('express-rate-limit');

    const loginLimiter = rateLimit({
      windowMs: 15 * 60 * 1000,
      max: 5,
      standardHeaders: true,
      legacyHeaders: false,
      message: { message: 'Demasiados intentos de login. Intenta en 15 minutos.' }
    });

    router.post('/login', loginLimiter, login);

---

## 7) Activar cabeceras de seguridad (helmet) (media)

### Donde aplicar
- Archivo: app.js
- Punto exacto: despues de crear app y antes de rutas.

### Fragmento de codigo

    const helmet = require('helmet');

    app.use(helmet({
      contentSecurityPolicy: false
    }));

Nota: en APIs puras, CSP puede desactivarse inicialmente para evitar bloqueos inesperados.

---

## 8) Limitar tamano de payload JSON (baja-media)

### Donde aplicar
- Archivo: app.js
- Punto exacto: reemplazar express.json() actual.

### Fragmento de codigo

    app.use(express.json({ limit: '1mb' }));

Si subes archivos o payloads pesados, usa endpoints separados con limites especificos.

---

## 9) Mejorar mensajes y logs de autenticacion (baja)

### Donde aplicar
- Archivo: src/services/authService.js
- Punto exacto: reemplazar logs que distinguen usuario inexistente vs password incorrecta.

### Fragmento de codigo

    if (!user) {
      return null;
    }

    const validPassword = await bcrypt.compare(password, user.password);
    if (!validPassword) {
      return null;
    }

En logs de produccion, registrar solo eventos agregados (sin filtrar detalles sensibles).

---

## 10) Eliminar credenciales hardcodeadas de pruebas

### Donde aplicar
- Archivo: verificarRoles.js
- Accion recomendada:
  - Mover usuarios de prueba a variables de entorno o fixtures locales no versionadas.
  - Agregar exclusion en .gitignore si el archivo es solo de laboratorio.

### Ejemplo rapido de carga por .env

    TEST_USERS_JSON=[{"rol":"CEO","username":"demo","password":"cambia-esto"}]

    const usuarios = JSON.parse(process.env.TEST_USERS_JSON || '[]');

---

## Orden recomendado de implementacion
1. JWT obligatorio + solo Bearer.
2. Rate limit en login.
3. Mass assignment (allowlist) + validacion Joi.
4. CORS restringido + Helmet.
5. Limite de payload + limpieza de logs + quitar credenciales de prueba.

## Checklist de verificacion final
- [ ] La API no inicia si falta JWT_SECRET.
- [ ] /api/auth/login bloquea tras varios intentos.
- [ ] No se aceptan campos extra en create/update.
- [ ] CORS solo permite tus dominios.
- [ ] Headers de seguridad activos.
- [ ] Sin credenciales de prueba en repositorio.