# Documentación de Parches de Seguridad (Backend)

**Fecha:** 27 de Marzo de 2026 (Actualización de Seguridad)
**Responsable:** Arquitectura / Senior Backend Developer
**Objetivo:** Mitigar las vulnerabilidades críticas detectadas en el informe de seguridad sin impactar la compatibilidad y funcionalidad del cliente frontend (`D:\Constructora`).

---

## 1. Implementación de Cabeceras de Seguridad y Control de Payload (app.js)

Se han añadido controles a nivel de aplicación para mitigar ataques como inyecciones de cabeceras, clickjacking, MIME sniffing y ataques de denegación de servicio (DoS) por payloads inusualmente grandes.

### Cambios realizados:
- **Helmet:** Se instaló y configuró la librería `helmet` (`npm install helmet`). Helmet configura automáticamente más de una decena de cabeceras de seguridad HTTP robustas.
- **Límite en Body Parser:** El middleware `express.json()` se actualizó a `express.json({ limit: '2mb' })`. Esto previene que un atacante sature el Node Event Loop o consuma toda la memoria del servidor enviando un JSON masivo.

```javascript
// En app.js
const helmet = require('helmet');

const app = express();
app.use(helmet()); // Refuerzo de cabeceras HTTP
app.use(cors()); // Se mantiene permisivo temporalmente por retrocompatibilidad
app.use(express.json({ limit: '2mb' })); // Límite de payload
```

---

## 2. Reforzamiento del Autenticador (authMiddleware.js y jwt.js)

La gestión de JWT tenía configuraciones por defecto que permitían el uso de contraseñas débiles en caso de no existir las variables de entorno, y el middleware permitía recibir tokens por cabeceras no estándar y *query strings*.

### Cambios realizados:
- **Eliminación de *Fallbacks* Inseguros:** Se retiró el string `'secretito'` y `'dev_secret'`. Ahora, si el entorno no inyecta `process.env.JWT_SECRET`, la aplicación hace un *Fail-Safe* (termina la ejecución inmediatamente con `process.exit(1)`) para evitar correr vulnerable en producción.
- **Validación Estricta de Bearer Token:** La función `extractTokenFromReq` se reescribió para aceptar *exclusivamente* la cabecera `Authorization: Bearer <token>`. Se anuló el acceso mediante `x-access-token`, `x_token`, `xapikey` y *query strings* (`?token=...`).

```javascript
// En src/middleware/authMiddleware.js
if (!process.env.JWT_SECRET) {
  console.error("FATAL ERROR: JWT_SECRET no está definido en el archivo .env");
  process.exit(1);
}
const SECRET = process.env.JWT_SECRET;

function extractTokenFromReq(req) {
  const authHeader = req.headers.authorization || req.headers.Authorization;
  if (authHeader && typeof authHeader === 'string' && authHeader.startsWith('Bearer ')) {
    return authHeader.split(' ')[1];
  }
  return null; // Bloquea el paso por URL o headers custom
}
```

---

## 3. Prevención de Ataques de Fuerza Bruta en el Login (auth.js)

Para proteger el endpoint crítico de inicio de sesión (`/api/auth/login`) contra ataques de diccionario y *credential stuffing*, se implementó control de cuotas de peticiones.

### Cambios realizados:
- **Rate Limiting:** Se instaló `express-rate-limit` y se configuró un umbral estricto para la ruta de login. Cada IP externa sólo podrá intentar iniciar sesión 10 veces en una ventana temporal de 15 minutos. 

```javascript
// En src/routes/auth.js
const rateLimit = require('express-rate-limit');

const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // Ventana de 15 minutos
  max: 10, // Máximo de 10 peticiones por IP
  message: { message: "Demasiados intentos de inicio de sesión desde esta IP, por favor intente nuevamente después de 15 minutos" }
});

router.post('/login', loginLimiter, login);
```

---

## 4. Remediación de Fugas de Credenciales

Se identificó el archivo raíz `verificarRoles.js` como un riesgo potencial ya que contenía *mock data* con contraseñas legibles (`password: '123'`).

### Cambios realizados:
- Eliminación del archivo `verificarRoles.js` del sistema para prevenir que cualquier mecanismo accidental exponga estas credenciales. Para futuras validaciones, se recomienda usar semillas generadas criptográficamente e inicializarlas vía CLI.

---

## Próximos Pasos Pendientes (Evaluación de Compatibilidad Frontend)

Para evitar romper el cliente actual en `D:\Constructora`, he diferido los siguientes parches de nivel arquitectónico, los cuales requerirán coordinación con el equipo Frontend:

1. **Configuración de CORS Excluyente:** Actualmente `app.use(cors())` es tolerante con todos los orígenes. **Pendiente:** Registrar la URL explícita de Vercel/Localhost del cliente y pasarla como parámetro al middleware cors.
2. **Filtrado contra *Mass Assignment*:** La mutación directa en `GenericService` (usar `...req.body`) es altamente dinámica y flexible para el Frontend. Limitarla inmediatamente rompería el envío de campos no explícitos si el Frontend ya se está aprovechando de esa flexibilidad. **Pendiente:** Implementar un validador (como *Zod* o *Joi*) en las rutas, que contraste la data entrante contra el Schema de persistencia validado y expulse atributos peligrosos (ej. `rol`, flags administrativos, etc).
