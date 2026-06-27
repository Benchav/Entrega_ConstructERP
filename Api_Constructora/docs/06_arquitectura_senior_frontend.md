# Arquitectura de Seguridad Senior - Frontend (Fase 4: Zero Trust)
**Fecha:** 27 de Marzo de 2026
**Objetivo:** Extender los estándares de seguridad y UX implementados en el backend hacia el cliente (React + Vercel).

## 1. Intercepción Global de Validaciones (Zod + Axios)
En la Fase 3 establecimos que el backend utilice Zod para rechazar cualquier `req.body` inválido con un código `400 Bad Request`.

### ¿Por qué lo mejoramos?
Para evitar tener que manejar try/catch individuales en los más de 20 componentes y formularios de la aplicación, interceptamos la respuesta del backend de forma global.

### Implementación (`src/lib/api.ts`)
- Se inyectó lógica en el bloque de respuesta de Axios (`apiClient.interceptors.response.use`).
- Si el backend arroja un `400`, el interceptor extrae dinámicamente el array de `errors` (que genera Zod) y muestra alertas flotantes nativas usando la librería `sonner` (`toast.error`).
- Además, ahora se capturan y avisan explícitamente los errores `403 Forbidden` en caso de que un usuario intente saltarse el acceso basado en roles (RBAC) a través de la API.

## 2. Hardening (Endurecimiento) del Cliente (Vercel CSP)
Dado que el frontend está alojado estáticamente, configuramos el servidor de despliegue (`vercel.json`) para obligar al navegador del usuario a comportarse de forma segura.

### Cabeceras inyectadas:
- **`Content-Security-Policy` (CSP):** Bloquea la carga y ejecución de scripts (XSS), estilos e iframes no declarados. Solo permite scripts originados desde el mismo dominio, y limita las conexiones `connect-src` exclusivamente a nuestra propia API (`https://api-constructora.vercel.app`). Se permitió cargar imágenes desde `pinterest` por el `favicon`.
- **`X-Frame-Options: DENY`:** Impide el Clickjacking (nadie puede meter el ERP dentro de un iframe engañoso).
- **`X-Content-Type-Options: nosniff`:** Evita que el navegador intente adivinar un tipo MIME que no corresponde.
- **`Permissions-Policy`:** Desactiva por defecto el acceso a cámara, micrófono y geolocalización, reduciendo la superficie de ataque.
