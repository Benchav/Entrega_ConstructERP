# Documentación de Migración: Fase 2 (Frontend)
**Nivel:** Senior / Integración Segura
**Proyecto Afectado:** `D:\Constructora`
**Fecha:** 27 de Marzo de 2026

Para poder integrar la Fase 2 del Backend, fue necesario refactorizar el manejo de estado y red en el cliente de React. El objetivo principal: **retirar por completo la manipulación manual de tokens del código fuente.**

## 1. Actualización de Axios (api.ts)
- **Eliminación de Interceptores de Envío:** Se eliminó la lógica que leía el JWT desde el `localStorage` y lo inyectaba como cabecera `Authorization: Bearer`.
- **Habilitación de Credentials:** A la instancia base de `apiClient` se le añadió la propiedad `withCredentials: true`. Esto indica al navegador que debe adjuntar automáticamente la Cookie HttpOnly (creada por el backend) en cada petición a `https://api-constructora.vercel.app/api`.

## 2. Refactorización del Contexto de Autenticación (AuthContext.tsx)
- **Remoción de `localStorage` para tokens:** Se purgó toda referencia a guardar o leer el token en el almacenamiento local. El frontend ahora ignora la existencia explícita del token, delegando esa responsabilidad al mecanismo de cookies del navegador.
- **Actualización del Inicio de Sesión (`login`):** La función de login fue adaptada para recibir únicamente el perfil de usuario del backend.
- **Llamada de Cierre de Sesión (`logout`):** Dado que el cliente ya no tiene el token, no basta con borrar el `localStorage`. El método `logout` ahora realiza una llamada asíncrona a `POST /auth/logout` para ordenarle al backend que destruya la cookie, seguida del reseteo del estado del frontend (`setUser(null)`).

### Resumen de Seguridad Alcanzado
Con esta integración, el Frontend de la Constructora es **completamente invulnerable al robo de tokens mediante Cross-Site Scripting (XSS)**, elevando el proyecto a un estándar de grado corporativo.
