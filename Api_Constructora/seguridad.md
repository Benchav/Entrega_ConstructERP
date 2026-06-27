# Informe de Seguridad - API Constructora

Fecha: 27/3/2026
Alcance: revision de backend completo (Node.js + Express + Firebase)

## Resumen ejecutivo
Se identificaron vulnerabilidades criticas y altas que pueden comprometer autenticacion, autorizacion e integridad de datos.

Hallazgos mas graves:
1. Secretos JWT inseguros por valores por defecto hardcodeados.
2. Mass assignment en controladores/servicios genericos (se aceptan campos arbitrarios).
3. CORS permisivo (cualquier origen).
4. Ausencia de rate limiting y proteccion anti-fuerza-bruta en login.
5. Exposicion de credenciales de prueba en archivo de verificacion de roles.

## Metodologia
- Revision estatica de configuracion global, middleware, rutas, controladores, servicios y modelos.
- Verificacion de controles OWASP API Top 10 relevantes:
  - API1 Broken Object Level Authorization
  - API2 Broken Authentication
  - API3 Broken Object Property Level Authorization
  - API4 Unrestricted Resource Consumption
  - API8 Security Misconfiguration
  - API10 Unsafe Consumption of APIs

## Hallazgos detallados

### 1) [CRITICA] JWT secret debil/inseguro por fallback hardcodeado
- Evidencia:
  - src/middleware/authMiddleware.js:5 -> `process.env.JWT_SECRET || 'secretito'`
  - src/utils/jwt.js:4 -> `process.env.JWT_SECRET || 'dev_secret'`
- Impacto:
  - Si el secreto real no esta configurado o es predecible, un atacante puede forjar tokens JWT y suplantar usuarios con privilegios altos (ej. CEO).
- Vector de ataque:
  - Fuerza bruta/diccionario sobre JWT o uso directo del secreto por defecto.
- OWASP relacionado:
  - API2 Broken Authentication
- Recomendacion:
  - Eliminar fallbacks inseguros.
  - Forzar fallo de arranque si `JWT_SECRET` no existe.
  - Usar secreto largo y aleatorio (>= 32 bytes) y rotacion periodica.

### 2) [CRITICA] Mass assignment (escalamiento de privilegios y alteracion de datos)
- Evidencia:
  - src/controllers/genericController.js:34,44 -> usa req.body directo en create/update.
  - src/services/genericService.js:89-95,111 -> persiste data sin whitelist de campos.
- Impacto:
  - Usuarios autenticados pueden inyectar propiedades sensibles no previstas (ej. `rol`, `id`, estados administrativos, flags internos).
  - Puede permitir escalamiento horizontal/vertical segun datos manipulados.
- Vector de ataque:
  - Enviar payload con campos extra en POST/PUT/PATCH.
- OWASP relacionado:
  - API3 Broken Object Property Level Authorization
- Recomendacion:
  - Implementar validacion estricta por esquema (Joi/Zod/Ajv).
  - Aplicar allowlist por entidad para create/update.
  - Bloquear cambios a campos sensibles en backend (no confiar en frontend).

### 3) [ALTA] Aceptacion de token por query string y cabeceras no estandar
- Evidencia:
  - src/middleware/authMiddleware.js:27-40 (lee token desde `query.token`, `query.access_token`, `xapikey`, etc.)
- Impacto:
  - Tokens en URL pueden filtrarse en logs, historial, proxies, analytics y referers.
  - Aumenta superficie de robo de sesion.
- Vector de ataque:
  - Recoleccion de URLs logueadas o compartidas.
- OWASP relacionado:
  - API2 Broken Authentication
- Recomendacion:
  - Aceptar solo `Authorization: Bearer <token>`.
  - Rechazar tokens en query params y headers ambiguos.

### 4) [ALTA] CORS demasiado permisivo
- Evidencia:
  - app.js:23 -> `app.use(cors())`
- Impacto:
  - Cualquier dominio puede invocar la API desde navegador.
  - Facilita abuso de endpoints y exfiltracion en escenarios con credenciales reutilizadas.
- Vector de ataque:
  - Sitios externos disparan llamadas a la API desde clientes victima.
- OWASP relacionado:
  - API8 Security Misconfiguration
- Recomendacion:
  - Definir lista blanca de origins por entorno (dev/staging/prod).
  - Restringir metodos y headers permitidos.

### 5) [ALTA] Sin rate limiting ni proteccion anti brute-force en login
- Evidencia:
  - package.json no incluye `express-rate-limit` ni middleware equivalente.
  - src/routes/auth.js no aplica limite por IP/usuario para `/auth/login`.
- Impacto:
  - Permite ataques de fuerza bruta y credential stuffing.
  - Puede derivar en DoS por abuso de peticiones.
- Vector de ataque:
  - Automatizacion de intentos de login.
- OWASP relacionado:
  - API2 Broken Authentication, API4 Unrestricted Resource Consumption
- Recomendacion:
  - Limitar intentos por IP y por cuenta.
  - Backoff progresivo y bloqueo temporal.
  - Alertas por patrones de abuso.

### 6) [MEDIA] Credenciales de prueba en texto plano
- Evidencia:
  - verificarRoles.js:6-20 contiene usuarios y `password: '123'`.
- Impacto:
  - Riesgo de exposicion de cuentas validas y malas practicas operativas.
  - Si se reusan en entornos reales, compromiso inmediato.
- Vector de ataque:
  - Acceso al repositorio o artefactos de build.
- OWASP relacionado:
  - API8 Security Misconfiguration
- Recomendacion:
  - Eliminar credenciales hardcodeadas del repo.
  - Usar datos de prueba via variables de entorno/fixtures seguras.

### 7) [MEDIA] Falta de hardening HTTP (cabeceras de seguridad)
- Evidencia:
  - app.js no usa Helmet ni politicas de seguridad HTTP.
- Impacto:
  - Menor defensa frente a clickjacking, MIME sniffing y otros ataques web.
- OWASP relacionado:
  - API8 Security Misconfiguration
- Recomendacion:
  - Integrar `helmet()` con configuracion por entorno.

### 8) [MEDIA] Validacion de entrada parcial e insuficiente
- Evidencia:
  - Modelos validan mayormente campos requeridos, sin controles fuertes de tipo/formato/rango.
  - Controladores aplican validaciones basicas pero no sanitizacion robusta.
- Impacto:
  - Riesgo de datos inconsistentes, bypass de reglas de negocio y ataques de payload malicioso.
- OWASP relacionado:
  - API8 Security Misconfiguration
- Recomendacion:
  - Definir validacion estricta por endpoint (tipos, enums, longitud, regex, rangos).
  - Sanitizar y normalizar entradas.

### 9) [BAJA] Logging con informacion util para atacantes
- Evidencia:
  - src/services/authService.js: logs de usuario no encontrado/contrasena incorrecta.
  - Multiples `console.error(error)` en controladores/servicios.
- Impacto:
  - En entornos compartidos, los logs pueden revelar estructura interna y patrones de autenticacion.
- Recomendacion:
  - Logging estructurado con niveles.
  - Evitar detalles sensibles en produccion.

### 10) [BAJA] Sin limite explicito de tamano de payload JSON
- Evidencia:
  - app.js usa `express.json()` sin `limit` personalizado.
- Impacto:
  - Mayor riesgo de consumo excesivo de recursos ante payloads grandes.
- OWASP relacionado:
  - API4 Unrestricted Resource Consumption
- Recomendacion:
  - Definir limite (ej. `express.json({ limit: '1mb' })`) segun caso de uso.

## Vulnerabilidades explotables vs mejoras de hardening

Explotables actualmente:
- JWT secret por defecto/hardcodeado.
- Mass assignment en CRUD generico.
- Tokens permitidos en query/header no estandar.
- Ausencia de rate limiting en login.

Mejoras de hardening (importantes):
- Helmet y configuracion de cabeceras.
- Politicas CORS estrictas.
- Mejor logging y manejo centralizado de errores.
- Limites de payload y controles anti-abuso adicionales.

## Priorizacion de remediacion

Fase 1 (inmediata):
1. Quitar secretos por defecto JWT y forzar env obligatoria.
2. Implementar validacion/allowlist de campos para create/update.
3. Limitar extraccion de token solo a Authorization Bearer.
4. Activar rate limit estricto en /api/auth/login.

Fase 2 (corto plazo):
1. Restringir CORS por lista blanca.
2. Integrar Helmet.
3. Eliminar credenciales de prueba hardcodeadas.

Fase 3 (mejora continua):
1. Logging estructurado y auditoria de acciones criticas.
2. Politicas de rotacion de secretos y monitoreo de seguridad.
3. Pruebas automatizadas de seguridad (SAST + pruebas de autorizacion).

## Nota final para el analisis academico
Este backend es funcional, pero presenta debilidades tipicas de una API en etapa inicial. Para un contexto de clase de ciberseguridad, los casos de mayor valor didactico son: suplantacion por JWT debil, escalamiento por mass assignment y fuerza bruta por falta de rate limiting.
