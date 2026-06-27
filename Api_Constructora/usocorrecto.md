# Manual de Uso Correcto (Docker)

Este documento explica cómo levantar y detener el ecosistema completo (Backend + Frontend) de **ConstructERP** de manera correcta usando Docker.

---

## 📂 Estructura recomendada de la entrega

Para evaluar el proyecto de la forma más sencilla, asegúrese de que la carpeta que contiene el proyecto tenga esta estructura exacta:

```text
📁 Entrega_ConstructERP/ (O el nombre de su carpeta principal)
   ├── 📁 Api_Constructora/
   ├── 📁 Constructora/
   └── 📄 docker-compose.yml
```

> **IMPORTANTE**: El archivo `docker-compose.yml` debe estar **afuera** de las dos carpetas de los proyectos, es decir, al mismo nivel que ellas.

---

## 🚀 Comandos de Ejecución

Abra su terminal o consola de comandos, **navegue hasta la carpeta principal** (`Entrega_ConstructERP/` o donde haya extraído el proyecto) y ejecute los siguientes comandos:

### 1. Levantar el Proyecto (Construcción e Inicialización)
Este comando descargará las dependencias y construirá las imágenes del frontend y backend de manera automática. Puede tardar un par de minutos la primera vez.

```bash
docker compose up -d --build
```

Una vez que finalice, la aplicación estará disponible en:
* **Frontend (Sistema):** [http://localhost](http://localhost)
* **Backend API (Swagger):** [http://localhost:3000/docs](http://localhost:3000/docs)

### 2. Ver el estado y los Logs (Opcional)
Si desea monitorear lo que está sucediendo en los servidores en tiempo real, utilice:

```bash
docker compose logs -f
```
*(Para salir de los logs, presione `Ctrl + C`)*.

### 3. Detener y Apagar el Proyecto
Para detener todos los servicios y liberar los puertos sin borrar la base de datos de los contenedores, ejecute:

```bash
docker compose down
```

---

## ⚠️ Posibles Errores

* **Error: `project name must not be empty` o `no configuration file provided`**
  Este error ocurre si intenta ejecutar los comandos `docker compose` estando dentro de la carpeta `Api_Constructora/` o `Constructora/`.
  **Solución:** Asegúrese de estar en la carpeta raíz (la que contiene el archivo `docker-compose.yml`).
