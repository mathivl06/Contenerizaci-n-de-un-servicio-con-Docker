# Contenerización de un servicio con Docker
Tarea Corta 1 del curso Arquitectura e Ingeniería de Datos.
El objetivo es la contenerización de un servicio propio y su orquestación junto a una base de datos PostgreSQL mediante Docker y Docker Compose. El grupo desarrolla un servicio HTTP, escribe su Dockerfile y el docker-compose.yml correspondiente, y justifica por escrito cada decisión de construcción y orquestación.

## Dockerfile propio

El servicio se construye mediante un Dockerfile propio ubicado en la raíz del proyecto. La imagen utiliza `node:24-slim`, una imagen oficial basada en Debian Slim. Se eligió porque proporciona los requisitos necesarios para ejecutar Node.js y ofrece una imagen reducida. Además, evita algunos problemas de compatibilidad que pueden presentarse al utilizar Alpine con determinadas dependencias de Node.js.

El contenido del Dockerfile es el siguiente:

```dockerfile
FROM node:24-slim

WORKDIR /app

COPY package*.json ./

RUN npm ci --omit=dev

COPY --chown=node:node . .

USER node

EXPOSE 2000

CMD ["npm", "start"]
```

### Decisiones de construcción

- `FROM node:24-slim` selecciona una imagen base oficial con el entorno de ejecución de Node.js.
- `WORKDIR /app` establece el directorio de trabajo dentro del contenedor.
- `COPY package*.json ./` copia primero `package.json` y `package-lock.json`, que son los archivos necesarios para instalar las dependencias.
- `RUN npm ci --omit=dev` instala las dependencias de forma reproducible usando el lockfile y omite las dependencias de desarrollo, como Jest y Supertest, porque no son necesarias para ejecutar la API en producción.
- `COPY --chown=node:node . .` copia el código del servicio y asigna su propiedad al usuario de ejecución `node`.
- `USER node` evita ejecutar la aplicación como `root` dentro del contenedor.
- `EXPOSE 2000` documenta el puerto que utiliza la aplicación.
- `CMD ["npm", "start"]` inicia el servicio mediante el script definido en `package.json`.

### Archivos excluidos de la imagen

El archivo `.dockerignore` evita enviar al contexto de construcción archivos que no son necesarios para ejecutar la API. Entre ellos se encuentran:

- `.git/` y `.gitignore`, para excluir el historial y la configuración de Git.
- `.env*`, para evitar incluir archivos locales con configuración o credenciales.
- `node_modules/`, porque las dependencias se instalan dentro de la imagen mediante `npm ci`.

