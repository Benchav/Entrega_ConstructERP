# ============================
# Backend Dockerfile - Api_Constructora
# Multi-stage build: Producción optimizada
# ============================

# --- Stage 1: Dependencias ---
FROM node:20-alpine AS deps

WORKDIR /app

# Copiar solo los archivos de manifiesto para aprovechar la caché de Docker
COPY package.json package-lock.json* ./

# Instalar SOLO dependencias de producción
RUN npm ci --omit=dev --ignore-scripts

# --- Stage 2: Producción ---
FROM node:20-alpine AS runner

WORKDIR /app

# Crear usuario no-root para seguridad (principio de mínimo privilegio)
RUN addgroup --system --gid 1001 nodejs \
    && adduser --system --uid 1001 appuser

# Copiar dependencias desde la etapa anterior
COPY --from=deps /app/node_modules ./node_modules

# Copiar código fuente de la aplicación
COPY . .

# El usuario no-root ejecutará el proceso
USER appuser

# Puerto expuesto (informativo, docker-compose lo mapea)
EXPOSE 3000

# Healthcheck: verifica que el servidor responda
HEALTHCHECK --interval=30s --timeout=5s --start-period=10s --retries=3 \
    CMD wget --no-verbose --tries=1 --spider http://localhost:3000/ || exit 1

# Comando de inicio
CMD ["node", "server.js"]
