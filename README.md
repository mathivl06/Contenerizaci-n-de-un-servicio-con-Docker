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

## Contrato de las rutas

La API utiliza el prefijo `/paTOSrest` y devuelve respuestas en formato JSON, excepto `DELETE`, que responde sin cuerpo cuando la eliminación es exitosa.

### Comprobaciones de estado

| Método | Ruta | Descripción | Respuesta exitosa |
| --- | --- | --- | --- |
| `GET` | `/paTOSrest/health` | Comprueba que el proceso está vivo sin consultar PostgreSQL. | `200` y `{ "status": "OK" }` |
| `GET` | `/paTOSrest/ready` | Comprueba que la aplicación puede consultar PostgreSQL. | `200` y `{ "status": "Ready" }` |

Si PostgreSQL no está disponible, `/paTOSrest/ready` responde `503` con `{ "status": "Not Ready" }`.

### Recurso `platillos`

Cada platillo contiene `platillo_id`, `nombre`, `descripcion` y `precio`. Los campos `nombre` y `descripcion` son textos obligatorios; `precio` es obligatorio, no puede ser negativo y admite como máximo dos decimales.

| Método | Ruta | Autenticación | Respuesta |
| --- | --- | --- | --- |
| `GET` | `/paTOSrest/platillos` | No requiere token. | `200` con la lista de platillos. |
| `GET` | `/paTOSrest/platillos/:id` | No requiere token. | `200` con el platillo solicitado o `404` si no existe. |
| `POST` | `/paTOSrest/platillos` | Requiere token válido con el rol `patos_admin`. | `201` con el platillo creado. |
| `PATCH` | `/paTOSrest/platillos/:id` | Requiere token válido con el rol `patos_admin`. | `200` con el platillo actualizado o `404` si no existe. |
| `DELETE` | `/paTOSrest/platillos/:id` | Requiere token válido con el rol `patos_admin`. | `204` sin cuerpo o `404` si no existe. |

El cuerpo de `POST` debe incluir todos los campos de la entidad:

```json
{
	"nombre": "Pato Casado",
	"descripcion": "Arroz, frijoles, maduro y ensalada",
	"precio": 4500
}
```

El cuerpo de `PATCH` puede incluir uno o más de esos campos. Los cuerpos inválidos responden `400`. Una solicitud de modificación sin token, con un token inválido o con el formato incorrecto responde `401`; un token válido sin el rol `patos_admin` responde `403`.

La lista admite los filtros `sort=precio` y `limit`, por ejemplo:

```text
GET /paTOSrest/platillos?sort=precio&limit=2
```

## Pruebas unitarias y de integración

Las pruebas se encuentran en el directorio `tests/` y se ejecutan dentro de un contenedor independiente definido por el servicio `test-runner` de Compose. Este servicio utiliza `Dockerfile.test`, instala también las dependencias de desarrollo y espera a que la API y Keycloak estén saludables antes de comenzar.

El script principal ejecuta primero las pruebas unitarias y luego las de integración:

```bash
npm test
```

Los scripts disponibles son:

```bash
npm run test:unit
npm run test:integration
```

Las pruebas unitarias validan la lógica de los campos de `platillos.validation.js`, incluyendo cuerpos vacíos e identificadores inválidos. Las pruebas de integración utilizan Supertest contra la aplicación en Compose y cubren:

- `GET /paTOSrest/health` y las consultas públicas de platillos.
- Obtención automática de tokens de Keycloak para `paTOSadmin` y `paTOclient`.
- Rechazo de operaciones protegidas sin token (`401`).
- Rechazo de un token válido sin el rol `patos_admin` (`403`).
- Creación, actualización y eliminación con el token administrativo (`201`, `200` y `204`).

Para ejecutar todas las pruebas contra la pila completa, desde la raíz del proyecto utilice:

```bash
docker compose --profile test run --rm test-runner
```

El perfil `test` crea el contenedor temporal, ejecuta `npm test` y lo elimina al terminar. Compose proporciona al runner las variables internas `APP_URL` y `KEYCLOAK_URL`, por lo que las pruebas se conectan a los servicios por sus nombres dentro de la red de Compose.

## Flujo para correr la app

### Requisitos previos

- Docker Engine instalado y en ejecución.
- Docker Compose disponible mediante `docker compose`.
- Puertos `2000` y `8080` disponibles en la máquina anfitriona.
- Postman, si se desea demostrar manualmente las rutas y la autenticación.

Después de clonar el repositorio, entre en la carpeta del proyecto:

```bash
cd Contenerizaci-n-de-un-servicio-con-Docker
```

Copie el archivo de variables de entorno:

```bash
cp .env.example .env
```

El archivo `.env.example` contiene los valores de desarrollo necesarios para PostgreSQL, la API y Keycloak. No es necesario modificar el host de PostgreSQL: la aplicación utiliza `db`, que es el nombre del servicio dentro de la red de Compose.

### Arranque

Construya la imagen de la API y levante la pila en segundo plano:

```bash
docker compose up -d --build
```

La pila contiene PostgreSQL, Flyway, Keycloak y la API. Flyway aplica automáticamente las migraciones de `DataBaseScript/` después de que PostgreSQL esté saludable. La API se considera saludable mediante `GET /paTOSrest/health` y espera a que Flyway finalice correctamente.

Compruebe el estado de los servicios con:

```bash
docker compose ps
```

### Ejecución de pruebas

Con la pila levantada, ejecute el runner de pruebas:

```bash
docker compose --profile test run --rm test-runner
```

El comando debe terminar con todas las pruebas unitarias y de integración aprobadas.

### Verificación manual con Postman

Para comprobar la API manualmente, cree las siguientes solicitudes:

| Método | URL | Resultado esperado |
| --- | --- | --- |
| `GET` | `http://localhost:2000/paTOSrest/health` | `200` y estado `OK`. |
| `GET` | `http://localhost:2000/paTOSrest/ready` | `200` y estado `Ready`. |
| `GET` | `http://localhost:2000/paTOSrest/platillos` | `200` con la lista almacenada en PostgreSQL. |

Para las rutas protegidas, obtenga primero un token desde Keycloak mediante `POST` a `http://localhost:8080/realms/paTOS/protocol/openid-connect/token`. En **Body**, seleccione **x-www-form-urlencoded** y utilice:

| Clave | Valor |
| --- | --- |
| `client_id` | `patos-rest-api` |
| `grant_type` | `password` |
| `username` | `paTOSadmin` |
| `password` | `paTOS` |

Copie `access_token` y configúrelo como **Bearer Token** en una solicitud `POST`, `PATCH` o `DELETE` a la API. Por ejemplo, para crear un platillo:

```json
{
  "nombre": "Pato Casado",
  "descripcion": "Arroz, frijoles, maduro y ensalada",
  "precio": 4500
}
```

La creación debe responder `201`. Una solicitud sin token responde `401` y una solicitud con un token de `paTOclient`, que no posee el rol `patos_admin`, responde `403`.

### Persistencia

Para comprobar que PostgreSQL conserva los datos:

1. Cree un platillo mediante `POST` y guarde su `platillo_id`.
2. Detenga los contenedores sin eliminar los volúmenes:

```bash
docker compose down
```

3. Vuelva a levantar la aplicación:

```bash
docker compose up -d
```

4. Consulte `GET http://localhost:2000/paTOSrest/platillos/{id}` en Postman. El platillo debe seguir existiendo.

Los datos persisten porque PostgreSQL utiliza el volumen `restaurant-db-volume` declarado en Compose.

### Apagado y eliminación de datos

Para detener la aplicación conservando los datos:

```bash
docker compose down
```

Para detenerla y eliminar también el volumen de PostgreSQL:

```bash
docker compose down -v
```
