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

Las pruebas se encuentran en el directorio `tests/`. Las pruebas unitarias validan la lógica de los campos de `platillos.validation.js`. Las pruebas de integración ejercitan los endpoints contra la aplicación y requieren que PostgreSQL y Flyway estén disponibles.

Para ejecutar todas las pruebas mediante el script definido en `package.json` se utiliza:

```bash
npm test
```

También es posible ejecutar cada conjunto por separado:

```bash
npx jest tests/unit
npx jest tests/integration
```

Las pruebas de integración deben ejecutarse con la pila levantada mediante Docker Compose. El flujo esperado cubre `/health`, lectura de platillos y operaciones de creación, actualización y eliminación.

## Puesta en marcha del sistema

### Requisitos previos

- Docker Engine instalado y en ejecución.
- Docker Compose disponible mediante `docker compose`.
- Puertos `2000` y `8080` disponibles en la máquina anfitriona.

### Configuración

Desde la carpeta `Contenerizaci-n-de-un-servicio-con-Docker/`, copie el archivo de ejemplo:

```bash
cp .env.example .env
```

Complete `.env` con la configuración local de PostgreSQL, la aplicación y Keycloak. Como mínimo, `APP_DB_HOST` debe ser `db`, porque ese es el nombre del servicio dentro de la red de Compose; no debe utilizarse `localhost` para la conexión de la aplicación con PostgreSQL.

### Arranque

La primera vez, construya la imagen de la API y levante la pila completa con:

```bash
docker compose up --build
```

Compose inicia los servicios `db`, `flyway`, `keycloak` y `app`. PostgreSQL utiliza el volumen `restaurant-db-volume`. Flyway aplica automáticamente los scripts de `DataBaseScript/` y la aplicación espera a que la migración finalice correctamente.

### Verificación

Con los contenedores en ejecución, compruebe la salud de la API:

```bash
curl http://localhost:2000/paTOSrest/health
curl http://localhost:2000/paTOSrest/ready
curl http://localhost:2000/paTOSrest/platillos
```

La primera solicitud debe devolver `200` con estado `OK`; la segunda debe devolver `200` con estado `Ready` cuando PostgreSQL esté disponible.

### Autenticación con Keycloak

Keycloak importa el realm `paTOS` y expone su servicio en el puerto `8080`. El cliente utilizado por la API es `patos-rest-api`. La autenticación se realiza mediante Postman y utiliza el flujo de credenciales del usuario.

Para obtener el token en Postman:

1. Cree una solicitud `POST` hacia:
	`http://localhost:8080/realms/paTOS/protocol/openid-connect/token`
2. En la pestaña **Body**, seleccione **x-www-form-urlencoded**.
3. Agregue los siguientes campos:

	| Clave | Valor |
	| --- | --- |
	| `client_id` | `patos-rest-api` |
	| `grant_type` | `password` |
	| `username` | `paTOSadmin` |
	| `password` | `paTOS` |

4. Envíe la solicitud y copie el valor de `access_token` de la respuesta JSON.

Para consumir una ruta protegida:

1. Cree la solicitud correspondiente, por ejemplo `POST` hacia `http://localhost:2000/paTOSrest/platillos`.
2. En la pestaña **Authorization**, seleccione el tipo **Bearer Token**.
3. Pegue el valor de `access_token` en el campo **Token**.
4. En la pestaña **Body**, seleccione **raw**, formato **JSON**, y envíe un cuerpo como el siguiente:

```json
{
  "nombre": "Pato Casado",
  "descripcion": "Arroz, frijoles y ensalada",
  "precio": 4500
}
```

El usuario `paTOSadmin` posee el rol `patos_admin`, por lo que la solicitud responde `201`. Una solicitud protegida sin token o con un token inválido responde `401`; un token válido sin el rol requerido responde `403`.

### Persistencia y apagado

Después de crear un platillo, detenga y vuelva a levantar los servicios sin eliminar los volúmenes:

