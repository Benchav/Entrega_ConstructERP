# ============================
# Frontend Dockerfile - Constructora (React + Vite)
# Multi-stage build: Compilación + Nginx
# ============================

# --- Stage 1: Builder (Compilación) ---
FROM node:20-alpine AS builder

WORKDIR /app

# Copiar manifiestos para aprovechar caché de Docker
COPY package.json package-lock.json* ./

# Instalar TODAS las dependencias (incluidas devDependencies para el build)
RUN npm ci --ignore-scripts

# Copiar código fuente
COPY . .

# Variable de entorno para que Vite apunte al proxy de Nginx
# En Docker, el frontend accede al backend vía Nginx reverse proxy en /api
ENV VITE_API_URL=/api

# Compilar la aplicación para producción
RUN npm run build

# --- Stage 2: Runner (Nginx) ---
FROM nginx:stable-alpine AS runner

# Eliminar la configuración por defecto de Nginx
RUN rm /etc/nginx/conf.d/default.conf

# Copiar nuestra configuración personalizada
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Copiar los archivos estáticos compilados desde el builder
COPY --from=builder /app/dist /usr/share/nginx/html

# Puerto expuesto
EXPOSE 80

# Healthcheck: verifica que Nginx responda
HEALTHCHECK --interval=30s --timeout=5s --start-period=5s --retries=3 \
    CMD wget --no-verbose --tries=1 --spider http://localhost/ || exit 1

# Nginx se ejecuta en primer plano
CMD ["nginx", "-g", "daemon off;"]
