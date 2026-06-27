# Reporte de Pruebas de Integración y Seguridad
**Fecha:** 27 de Marzo de 2026
**Framework:** Jest + Supertest
**Objetivo:** Validar la resiliencia de la API contra ataques de nivel aplicativo y comprobar el funcionamiento de las nuevas políticas de seguridad (Helmet, Rate Limiting, HttpOnly Cookies y mitigación de Mass Assignment).

---

## 1. Diseño de la Suite de Pruebas

Para garantizar calidad de nivel de producción ("Senior"), se han implementado 3 suites de pruebas automatizadas (ubicadas en la carpeta `/tests`) que validan el comportamiento del sistema sin alterar la base de datos real en Firebase gracias a la técnica de *Mocking* (Simulación de servicios).

### Suite 1: Seguridad HTTP y Tráfico (`tests/security.test.js`)
- **✅ Validación de Helmet:** El test levanta el servidor y envía una petición genérica, verificando que la respuesta contenga las cabeceras defensivas estrictas (ej. `x-frame-options: SAMEORIGIN` y `content-security-policy`).
- **✅ Prevención de DoS por Payload:** Se envía un JSON de 3MB. El test exige que el servidor devuelva un error HTTP `413 Payload Too Large` inmediatamente (gracias a `express.json({ limit: '2mb' })`).
- **✅ Rate Limiting Anti-Fuerza Bruta:** Se simula un ataque enviando 10 intentos de login en menos de 1 segundo. En el intento número 11, se exige que el servidor corte la conexión y devuelva un `429 Too Many Requests`.

### Suite 2: Autenticación y Cookies (`tests/auth.test.js`)
- **✅ Login Seguro (HttpOnly):** Al enviar credenciales correctas, el test verifica que en el cuerpo del JSON *no* viaje el token. Luego, inspecciona las cabeceras buscando el comando `Set-Cookie` para certificar que el token viaja con la bandera `HttpOnly`.
- **✅ Rechazo Invalido:** Login falso devuelve HTTP `401 Unauthorized` sin generar cookies.
- **✅ Terminación de Sesión (Logout):** Llama a `/api/auth/logout` y verifica que el servidor invalide la cookie enviando una directiva de caducidad y limpieza (`token=; Max-Age=0`).

### Suite 3: Prevención de Mass Assignment (`tests/genericService.test.js`)
- **✅ Sanitización de Creación (Create):** Se envía un "ataque" inyectando campos críticos al registrar un dato: `{ nombre: 'Proyecto', rol: 'CEO', isAdmin: true }`. El test valida que el servicio genérico filtre y purgue exitosamente `rol` e `isAdmin` antes de invocar a Firebase.
- **✅ Blindaje en Actualización (Update):** Se intenta corromper un registro enviando un payload con un `id` diferente (tratando de reescribir la llave primaria). El test certifica que ese campo es borrado dinámicamente antes del `.set()` de Firestore.

---

## 2. Instrucciones de Ejecución

Para correr esta suite en tu entorno local o en tu sistema de Integración Continua (CI/CD) de GitHub/Vercel:

1. Asegúrate de haber instalado las dependencias de prueba:
   ```bash
   npm install --save-dev jest supertest
   ```
   *(Nota: Si en Windows experimentas errores de `ENOENT` durante el `npm install` debido al límite de caracteres en las rutas (Long Paths), ejecuta `npm cache clean --force` o habilita Long Paths en el registro de Windows).*

2. Ejecuta el comando de pruebas integrado en `package.json`:
   ```bash
   npm test
   ```

3. **Resultado Esperado:** 
   Jest levantará el entorno, simulará Firebase y el flujo de Express, e imprimirá una lista de comprobación verde confirmando que los 7 tests de seguridad críticos han pasado satisfactoriamente.
