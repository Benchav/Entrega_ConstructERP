# Documentación de Migración: Fase 2 (Backend)
**Nivel:** Senior / Arquitectura de Seguridad
**Fecha:** 27 de Marzo de 2026

En esta segunda fase se ha transformado el mecanismo de autenticación y se ha implementado un escudo a nivel de controladores genéricos para erradicar las vulnerabilidades más profundas detectadas en la arquitectura.

## 1. Migración a Cookies HttpOnly (Anti-XSS)
El JWT ya no se devuelve en formato JSON crudo al cliente. Esto evita que el Frontend lo almacene en lugares vulnerables a XSS (como `localStorage`).
- **Instalación:** Se incorporó `cookie-parser`.
- **Set Cookie (Login):** El controlador `authController.login` ahora genera una cookie HttpOnly (`res.cookie('token', ...)`). Esta cookie es invisible para JavaScript pero el navegador la envía automáticamente en cada petición subsecuente.
- **Validación (Middleware):** El archivo `authMiddleware.js` se actualizó para priorizar la lectura desde `req.cookies.token`, manteniendo el *fallback* de la cabecera `Authorization` para retrocompatibilidad.
- **Logout:** Se creó el endpoint `POST /api/auth/logout` que ejecuta `res.clearCookie('token')`, invalidando la sesión instantáneamente a nivel de navegador.

## 2. Configuración Estricta de CORS
Dado que las Cookies HttpOnly exigen el modo *Credentials*, el servidor ya no puede aceptar peticiones originadas desde cualquier lugar (`*`).
- **Whitelist:** En `app.js`, CORS fue configurado con `credentials: true`.
- **Entornos:** El origen aceptado por defecto es `http://localhost:5173`. Para producción, el sistema lee la variable de entorno `CORS_ORIGIN`, permitiendo inyectar dinámicamente la URL segura de despliegue sin tocar el código.

## 3. Blindaje contra Mass Assignment (GenericService)
La API cuenta con controladores genéricos que permitían crear o actualizar registros insertando directamente todo el `req.body` en Firestore. Un atacante podría haber inyectado propiedades privilegiadas (ej. `rol: "CEO"` o `isAdmin: true`).
- **Sanitización Intermedia:** En `genericService.js` (métodos `create` y `update`) se añadió un filtro que remueve explícitamente atributos administrativos (`rol`, `permisos`, `token`) antes del guardado.
- **Protección de IDs:** En actualizaciones, se remueve la clave del identificador para evitar que un usuario corrompa el registro apuntando a un ID distinto del de la URL.
