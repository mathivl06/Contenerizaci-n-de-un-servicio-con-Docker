# Migracion a Kubernetes con kind y Kustomize

Esta carpeta agrega una segunda forma de ejecutar el sistema, equivalente al `compose.yml`, usando Kubernetes sobre un cluster local de `kind`. No reemplaza Docker Compose ni modifica el codigo de la API.

## Estructura

```text
k8s/
├── base/
│   ├── namespace.yaml
│   ├── configmap.yaml
│   ├── secret.example.yaml
│   ├── postgres-deployment.yaml
│   ├── postgres-service.yaml
│   ├── postgres-pvc.yaml
│   ├── flyway-job.yaml
│   ├── keycloak-deployment.yaml
│   ├── keycloak-service.yaml
│   ├── app-deployment.yaml
│   ├── app-service.yaml
│   └── kustomization.yaml
└── overlays/
    └── local/
        ├── app-replicas-patch.yaml
        └── kustomization.yaml
```

El overlay `local` reutiliza la base y modifica algo real: cambia el `Deployment` de la API de 1 a 2 replicas.

## Requisitos

- Docker
- kubectl
- kind
- Node/npm, solo si se van a ejecutar las pruebas del proyecto

## 1. Crear el cluster

```bash
kind create cluster --name patos-cluster
kubectl cluster-info
kubectl get nodes
```

## 2. Construir y cargar la imagen de la API

Kubernetes en `kind` no ve automaticamente las imagenes locales de Docker, por eso hay que cargar la imagen al cluster.

```bash
docker build -t patos-rest-api:1 .
kind load docker-image patos-rest-api:1 --name patos-cluster
```

El `Deployment` usa `imagePullPolicy: Never` para que Kubernetes use la imagen local cargada en `kind`.

En `k8s/base/configmap.yaml`, `KEYCLOAK_HOSTNAME` queda como `localhost` para que el acceso por `kubectl port-forward service/keycloak 8080:8080` coincida con el hostname publico de Keycloak en el entorno local.

## 3. Crear el namespace

```bash
kubectl apply -f k8s/base/namespace.yaml
```

## 4. Crear el Secret real

No se versionan credenciales reales. La plantilla esta en `k8s/base/secret.example.yaml`; cree el Secret real con valores locales:

```bash
kubectl create secret generic patos-secret \
  --namespace patos-rest \
  --from-literal=POSTGRES_USER='paTOS' \
  --from-literal=POSTGRES_PASSWORD='paTOrestaurante!1' \
  --from-literal=APP_DB_USER='paTOS' \
  --from-literal=APP_DB_PASSWORD='paTOrestaurante!1' \
  --from-literal=KEYCLOAK_ADMIN_USERNAME='paTOS' \
  --from-literal=KEYCLOAK_ADMIN_PASSWORD='paTOS'
```

Para este proyecto, `APP_DB_USER` y `APP_DB_PASSWORD` deben coincidir con `POSTGRES_USER` y `POSTGRES_PASSWORD`, porque la API se conecta a la misma base de datos creada por PostgreSQL.

## 5. Crear ConfigMaps desde los archivos reales

Kustomize no puede leer archivos fuera de `k8s/base` con la restriccion de carga normal de `kubectl apply -k`. Para no copiar manualmente las migraciones ni el realm dentro de `k8s/`, estos ConfigMaps se crean desde las carpetas originales del proyecto.

```bash
kubectl create configmap flyway-sql \
  --namespace patos-rest \
  --from-file=DataBaseScript/V1__Init.sql \
  --from-file=DataBaseScript/V2__seed.sql \
  --dry-run=client \
  -o yaml | kubectl apply -f -
```

```bash
kubectl create configmap keycloak-realm \
  --namespace patos-rest \
  --from-file=realm-export.json=keycloak/realm-export.json \
  --dry-run=client \
  -o yaml | kubectl apply -f -
```

`flyway-sql` monta las migraciones en `/flyway/sql`. `keycloak-realm` monta `realm-export.json` en `/opt/keycloak/data/import`, igual que Compose.

## 6. Aplicar Kustomize

```bash
kubectl apply -k k8s/overlays/local
```

El despliegue crea:

- `Deployment/postgres`
- `Service/postgres`
- `PersistentVolumeClaim/postgres-data`
- `Job/flyway`
- `Deployment/keycloak`
- `Service/keycloak`
- `Deployment/patos-api`
- `Service/patos-api`
- `ConfigMap/patos-config`

## 7. Verificar el despliegue

```bash
kubectl get pods -n patos-rest
kubectl get services -n patos-rest
kubectl get pvc -n patos-rest
kubectl get jobs -n patos-rest
```

Esperar a que Flyway termine:

```bash
kubectl wait --for=condition=complete job/flyway -n patos-rest --timeout=180s
```

Verificar rollouts:

```bash
kubectl rollout status deployment/postgres -n patos-rest
kubectl rollout status deployment/keycloak -n patos-rest
kubectl rollout status deployment/patos-api -n patos-rest
```

Logs utiles:

```bash
kubectl logs deployment/postgres -n patos-rest
kubectl logs job/flyway -n patos-rest
kubectl logs deployment/keycloak -n patos-rest
kubectl logs deployment/patos-api -n patos-rest
```

## 8. Acceder a la API

El Service de la API es interno. Para probar desde la maquina anfitriona:

```bash
kubectl port-forward service/patos-api 2000:2000 -n patos-rest
```

En otra terminal:

```bash
curl http://localhost:2000/paTOSrest/health
curl http://localhost:2000/paTOSrest/ready
curl http://localhost:2000/paTOSrest/platillos
```

Crear un platillo:

```bash
curl -X POST http://localhost:2000/paTOSrest/platillos \
  -H 'Content-Type: application/json' \
  -d '{"nombre":"Pato Casado","descripcion":"Arroz, frijoles, maduro, ensalada y proteina","precio":4500}'
```

Actualizar:

```bash
curl -X PATCH http://localhost:2000/paTOSrest/platillos/1 \
  -H 'Content-Type: application/json' \
  -d '{"nombre":"Pato Actualizado"}'
```

Eliminar:

```bash
curl -X DELETE http://localhost:2000/paTOSrest/platillos/1
```

## 9. Acceder a Keycloak

```bash
kubectl port-forward service/keycloak 8080:8080 -n patos-rest
```

Luego abrir:

```text
http://localhost:8080
```

Keycloak se inicia con `quay.io/keycloak/keycloak:26.7.4`, `KC_HEALTH_ENABLED=true`, `KC_HOSTNAME` tomado del `ConfigMap` e importa el realm existente con `start-dev --import-realm`.

Nota: al inspeccionar el codigo actual de la API, solo se encontraron variables `APP_DB_*` y `APP_PORT`; no hay variables OIDC/JWT ni middleware de validacion de tokens en `src/`. Esta migracion conserva el comportamiento existente y despliega Keycloak igual que Compose, sin reescribir la aplicacion.

## 10. Persistencia

PostgreSQL usa el PVC `postgres-data`, montado en `/var/lib/postgresql`. Para verificar persistencia:

1. Crear un registro por la API.
2. Confirmar que aparece con `GET /paTOSrest/platillos`.
3. Eliminar el Pod de PostgreSQL, no el PVC:

```bash
kubectl delete pod -l app.kubernetes.io/name=postgres -n patos-rest
```

4. Esperar a que el Deployment cree otro Pod:

```bash
kubectl rollout status deployment/postgres -n patos-rest
```

5. Consultar de nuevo la API y confirmar que el dato sigue existiendo.

## 11. Correspondencia Docker Compose a Kubernetes

| Docker Compose | Kubernetes |
| --- | --- |
| `db` | `Deployment/postgres` + `Service/postgres` + `PersistentVolumeClaim/postgres-data` |
| `flyway` | `Job/flyway` |
| `keycloak` | `Deployment/keycloak` + `Service/keycloak` |
| `app` | `Deployment/patos-api` + `Service/patos-api` |
| `environment` | `ConfigMap/patos-config` + `Secret/patos-secret` |
| `restaurant-db-volume` | `PersistentVolumeClaim/postgres-data` |
| `healthcheck` | `livenessProbe`, `readinessProbe` y `startupProbe` |
| `depends_on` | probes, `initContainers` y el `Job` de Flyway |
| `ports` | `Service` interno + `kubectl port-forward` |
| `network` | DNS interno de Kubernetes mediante Services |
| `.env` | ConfigMap para valores no sensibles y Secret para credenciales |

Conceptos sin equivalente directo:

- `depends_on` no existe como tal en Kubernetes; se reemplazo con probes e `initContainers`.
- `build` no existe dentro del manifiesto; la imagen se construye con Docker y se carga a `kind`.
- Los bind mounts locales no se usan directamente; Flyway y Keycloak reciben sus archivos con ConfigMaps creados desde las carpetas reales.
- La red de Compose se reemplaza por Services y DNS interno.

## 12. Eliminar

Eliminar los recursos aplicados por Kustomize:

```bash
kubectl delete -k k8s/overlays/local
```

Como el namespace tambien se elimina, se eliminan los ConfigMaps y Secret creados dentro de `patos-rest`.

Eliminar el cluster completo:

```bash
kind delete cluster --name patos-cluster
```

Advertencia: eliminar el namespace o el cluster elimina el PVC y, con ello, los datos persistidos en esta instalacion local.
