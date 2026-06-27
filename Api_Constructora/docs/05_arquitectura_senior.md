# Arquitectura de Seguridad Senior (Fase 3: Zero Trust)
**Fecha:** 27 de Marzo de 2026
**Objetivo:** Implementación de controles estrictos de validación, trazabilidad de mutaciones y defensa contra falsificación de peticiones.

## 1. Validación Estricta con Zod
Hemos integrado `zod` como motor principal de validación de esquemas (Schema Validation).

### ¿Cómo funciona?
- **Middleware Genérico:** Se creó `src/middleware/validateZod.js`. Este middleware intercepta la petición (`req.body`) y la pasa por el esquema definido. Si hay datos inválidos (o campos extras maliciosos), la petición es rechazada inmediatamente con un `400 Bad Request` antes de siquiera tocar la lógica del controlador.
- **Implementación (Ejemplo Proyectos):** En `src/routes/proyectos.js` inyectamos la validación usando `proyectoSchema.js`. Esto garantiza que nadie pueda enviar un campo `presupuesto: "infinito"` provocando una inyección de tipos en la base de datos NoSQL.

## 2. Auditoría y Trazabilidad Activa (Audit Logs)
Un sistema de grado corporativo debe tener la capacidad de trazar todas las mutaciones. Firebase por sí solo no almacena "quién" hizo el cambio si no lo programamos.

### Flujo de Trazabilidad:
1. El JWT viaja en la Cookie (`HttpOnly`).
2. El middleware `authMiddleware.js` desencripta el token, recupera al usuario de la DB y lo inyecta en `req.user`.
3. El controlador genérico (`genericController.js`) lee `req.user` y lo pasa a los métodos mutadores del servicio (`create`, `update`, `remove`).
4. **En el GenericService**, el sistema hace 2 cosas críticas de forma invisible:
   - Inyecta marcas de tiempo y autoría directamente en el registro (`createdAt`, `createdBy`, `updatedAt`, `updatedBy`).
   - Crea un registro inmutable en la nueva colección `audit_logs` con la acción (`CREATE`, `UPDATE`, `DELETE`), la colección afectada, el ID del documento, el usuario responsable y la fecha.

## 3. Prevención de CSRF
Dado que el token viaja automáticamente gracias al mecanismo de Cookies, la aplicación era vulnerable a *Cross-Site Request Forgery* (Falsificación de Petición en Sitios Cruzados). 
Para mitigar esto, hemos asegurado que la cookie posea el flag `sameSite: 'strict'` en `authController.js`.
Esto obliga al navegador a *no adjuntar* la Cookie si la petición de la API proviene de un dominio web distinto al de origen, cerrando por completo la brecha CSRF sin necesidad de tokens complejos.
