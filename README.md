# SMK - Gestor de Documentos CSV

Aplicacion full-stack para carga, validacion y gestion de documentos CSV con autenticacion JWT y control de acceso por roles (RBAC).

## Stack

- **Lenguaje:** TypeScript en todo el proyecto (backend y frontend), tipado estricto (`strict: true`).
- **Backend:** Node.js + Express, arquitectura modular (routes / controllers / services / models / middlewares / validators).
- **Base de datos:** PostgreSQL.
- **ORM:** Sequelize (modelos tipados con `InferAttributes`/`InferCreationAttributes`).
- **Almacenamiento de archivos:** driver intercambiable (`STORAGE_DRIVER`). Por defecto guarda en disco local, tambien puedes ponerlo con s3 sin cambiar una linea de codigo.
- **Autenticacion:** JWT + bcrypt para el hash de contrasenas.
- **Documentacion de API:** Swagger / OpenAPI 3.0 (`swagger-ui-express`).
- **Testing:** Jest + ts-jest + Supertest (backend), Vitest + @vue/test-utils (frontend).
- **Calidad de codigo:** SonarQube (ejecucion local vía Docker).
- **Frontend:** Vue 3 (Option API con `defineComponent` + `<script lang="ts">`) + Vue Router + Pinia + Axios.
- **Infraestructura:** Docker + docker-compose (build multi-stage: compila TS y corre el JS resultante).

## Estructura del proyecto

```
.
├── docker-compose.yml
├── docker-compose.sonar.yml   # SonarQube local (analisis de calidad)
├── sonar-project.properties
├── .env.example                # credenciales de infraestructura (copiar a .env)
├── ejemplo.csv                 # CSV de ejemplo valido para probar la carga
├── backend/
│   ├── .sequelizerc              # rutas usadas por sequelize-cli
│   ├── config/config.js          # config de conexion para sequelize-cli (no usa el build de TS)
│   ├── migrations/                # migraciones versionadas (create-users, create-documents, create-records)
│   ├── tsconfig.json            # typecheck + tests (ts-jest)
│   ├── tsconfig.build.json      # build de produccion (solo src/, sin tests)
│   ├── tests/                   # Jest: unit + integration (.test.ts)
│   └── src/
│       ├── types/               # augmentacion de Express.Request (req.user)
│       ├── config/              # env, conexion a la BD, spec de Swagger
│       ├── models/              # User, Document, Record (Sequelize tipado)
│       ├── routes/               # definicion de endpoints
│       ├── controllers/          # capa HTTP (request/response)
│       ├── services/             # logica de negocio (auth, csv, documentos)
│       │   └── storage/          # drivers de almacenamiento: local.storage.ts, s3.storage.ts
│       ├── middlewares/          # auth (JWT), RBAC, rate limit, errores, multer (memoria)
│       ├── validators/           # validacion de inputs y filas del CSV
│       └── utils/                # ApiError, catchAsync, jwt
└── frontend/
    ├── tsconfig.json             # typecheck (vue-tsc)
    ├── tests/                    # Vitest: componentes, store, utils (.test.ts)
    └── src/
        ├── types/                 # tipos de dominio compartidos (CsvDocument, AuthUser, ...)
        ├── api/                   # instancia de axios con interceptor JWT
        ├── store/                 # Pinia: auth.ts, documents.ts
        ├── router/                # rutas y guard de autenticacion
        ├── utils/                 # csv.ts (parseo/reconstruccion CSV), errors.ts
        ├── views/                 # LoginView, RegisterView, DashboardView (<script lang="ts">)
        └── components/            # FileDropZone, DocumentsTable, AlertMessage, UploadResultModal
```

## Configuracion de credenciales

Las credenciales de infraestructura (password de PostgreSQL, secreto JWT) **no** estan hardcodeadas en `docker-compose.yml`: se leen desde un archivo `.env` en la raiz, que no se sube al repositorio (`.gitignore`).

```bash
cp .env.example .env
```

Ajusta los valores si lo deseas (en especial `JWT_SECRET`, que deberia ser una cadena larga y aleatoria por entorno). Si `.env` no existe o falta `DB_PASSWORD`/`JWT_SECRET`, `docker compose up` falla explicitamente en vez de arrancar con valores por defecto inseguros.

## Como ejecutar (Docker)

Requisitos: Docker y Docker Compose. **No hace falta cuenta de AWS** — por defecto los CSV se guardan en un volumen local del contenedor.

```bash
cp .env.example .env
docker compose up --build
```

Esto levanta:

- PostgreSQL en `localhost:5433` (mapeado a `5432` interno; se usa `5433` en el host para no chocar con un PostgreSQL local ya instalado)
- Backend (Express) en `http://localhost:4000`
- Documentacion interactiva (Swagger UI) en `http://localhost:4000/api/docs`
- Frontend (Vue servido por Nginx) en `http://localhost:5173`

El esquema se crea con **migraciones versionadas** (`sequelize-cli`, ver [`backend/migrations`](backend/migrations)), no con `sequelize.sync()`. El contenedor del backend espera a que Postgres este disponible (reintentos con backoff), corre `sequelize-cli db:migrate` automaticamente al arrancar, y recien despues levanta el servidor — sin ningun paso manual. Los archivos subidos quedan en el volumen `backend_uploads` (persiste entre reinicios de `docker compose up`/`down`).

### Alternativa: guardar en Amazon S3 en vez de disco local

El almacenamiento usa un driver intercambiable (`STORAGE_DRIVER`, ver [`storage.service.ts`](backend/src/services/storage.service.ts)). Para usar S3 real:

```bash
cp .env.example .env
# En .env: descomentar STORAGE_DRIVER=s3 y completar AWS_REGION, AWS_ACCESS_KEY_ID,
# AWS_SECRET_ACCESS_KEY y S3_BUCKET_NAME con datos de tu cuenta de AWS real
# (el bucket se crea solo si no existe).
docker compose up --build
```

O sin cuenta de AWS, contra un S3 emulado con LocalStack:

```bash
cp .env.example .env
# En .env: descomentar STORAGE_DRIVER=s3, S3_ENDPOINT=http://localstack:4566 y S3_FORCE_PATH_STYLE=true
# (AWS_ACCESS_KEY_ID / AWS_SECRET_ACCESS_KEY pueden quedar en cualquier valor, ej. "test")
docker compose --profile local up --build
```

En ambos casos el resto del flujo (subida, descarga, borrado) funciona identico al modo local — ningun otro archivo del proyecto sabe ni le importa que driver esta activo.

## Como ejecutar en modo desarrollo (sin Docker)

**Backend**

```bash
cd backend
cp .env.example .env
npm install
npm run migrate   # crea las tablas (una sola vez, o cada vez que haya migraciones nuevas)
npm run dev
```

Requiere una instancia de PostgreSQL accesible con los datos definidos en `.env`. Por defecto (`STORAGE_DRIVER=local`) no necesita nada mas: los archivos se guardan en `backend/uploads/`.

**Frontend**

```bash
cd frontend
cp .env.example .env
npm install
npm run dev
```

La app queda disponible en `http://localhost:5173`.

## Migraciones

El esquema de base de datos se versiona con `sequelize-cli` en [`backend/migrations`](backend/migrations) (`create-users`, `create-documents`, `create-records`) — no se usa `sequelize.sync()`. Con Docker se aplican solas al arrancar el contenedor del backend; en modo desarrollo hay que correrlas a mano:

```bash
cd backend
npm run migrate          # aplica las migraciones pendientes
npm run migrate:status   # ver cuales ya corrieron
npm run migrate:undo     # revertir la ultima migracion
npm run migrate:undo:all # revertir todas (deja la BD vacia)
```

Para agregar una tabla o columna nueva, se crea una migracion nueva (nunca se edita una ya aplicada):

```bash
cd backend
npx sequelize-cli migration:generate --name add-algo-a-documents
```

## Flujo de uso

1. Registrarse en `/register` indicando nombre, contrasena, confirmacion de contrasena y rol (`user` o `admin`).
2. Iniciar sesion en `/login`. El JWT se guarda y se envia automaticamente en cada peticion (`Authorization: Bearer <token>`).
3. En el Dashboard, arrastrar o seleccionar un archivo `.csv` (puede usarse `ejemplo.csv` incluido en la raiz del repo).
4. El backend valida el CSV completo antes de guardarlo: si alguna fila tiene errores (correo invalido, telefono no numerico, campos obligatorios vacios, etc.) se rechaza el archivo entero.
5. Al terminar la carga se muestra un **modal de resultado**:
   - **Exito:** confirma cuantos registros se procesaron.
   - **Error:** lista el detalle fila por fila (columna y motivo) y habilita el boton **"Descargar CSV con errores"**, que regenera el archivo original agregando una columna `errores` con el detalle de cada fila (vacia en las filas que si eran validas), para que el usuario corrija y vuelva a intentar.
6. Los documentos cargados se listan con nombre, usuario, fecha de carga y numero de registros.
7. Cualquier usuario autenticado puede descargar el archivo original. Solo los usuarios con rol `admin` pueden eliminarlo.

## Formato esperado del CSV

| Columna    | Tipo               | Obligatorio |
|------------|--------------------|-------------|
| `correo`   | Email valido       | Si          |
| `nombre`   | Texto              | Si          |
| `telefono` | Numerico           | Si          |
| `ciudad`   | Texto              | Si          |
| `notas`    | Texto              | No          |

## API

Documentacion interactiva completa (Swagger UI): **http://localhost:4000/api/docs**

Todas las rutas (excepto `/auth/*` y `/health`) requieren header `Authorization: Bearer <token>`.

| Metodo | Ruta                        | Descripcion                                  | Acceso        |
|--------|-----------------------------|-----------------------------------------------|---------------|
| POST   | `/api/auth/register`        | Registro de usuario                           | Publico       |
| POST   | `/api/auth/login`           | Login, retorna JWT                            | Publico       |
| GET    | `/api/documents`            | Listado de documentos cargados                | Autenticado   |
| POST   | `/api/documents/upload`     | Carga y valida un CSV (`multipart/form-data`, campo `file`) | Autenticado   |
| GET    | `/api/documents/:id/download` | Descarga el archivo CSV original            | Autenticado   |
| DELETE | `/api/documents/:id`        | Elimina un documento y sus registros          | Solo `admin`  |

## Seguridad implementada

- Contrasenas hasheadas con bcrypt (12 salt rounds), nunca se devuelven en las respuestas.
- JWT firmado con expiracion configurable; el secreto vive en `.env` (no versionado), no en el codigo ni en `docker-compose.yml`.
- RBAC mediante middleware (`authorize('admin')`) para el borrado de documentos.
- Sequelize con queries parametrizadas (previene inyeccion SQL).
- Validacion de inputs con `express-validator` en auth y validadores dedicados para cada fila del CSV.
- `helmet` para cabeceras HTTP seguras (CSP, HSTS, etc.), `cors` restringido al origen del frontend.
- **Rate limiting por capas** (`express-rate-limit`):
  - Limite general sobre toda la API: 300 peticiones / 15 min por IP.
  - Limite estricto en `/auth/login` y `/auth/register`: 20 intentos / 15 min por IP (mitiga fuerza bruta de credenciales).
  - Limite en `/documents/upload`: 40 cargas / 15 min por IP (operacion costosa en CPU/red).
- Subida de archivos restringida a `.csv`, con limite de tamano; se reciben en memoria (`multer.memoryStorage()`) y se guardan con una key aleatoria (uuid) generada por el backend — no se usa el nombre original del archivo para nada relacionado a rutas/almacenamiento, evitando path traversal (aplica igual en el driver local y en S3).
- Si la transaccion de base de datos falla luego de subir el archivo al storage, se borra ese archivo recien subido (compensacion) para no dejar basura huerfana.
- Manejo centralizado de errores con codigos HTTP correctos (400, 401, 403, 404, 409, 422, 500) y payloads sin exponer stack traces en produccion.

## Testing

**Backend (Jest + Supertest)** — 75 tests: validadores de CSV, servicios (auth, csv, documentos, template) con mocks de Sequelize, los dos drivers de almacenamiento (local con `node:fs` mockeado, S3 con el SDK de AWS mockeado) y la fachada que elige entre ellos, middleware de RBAC, y tests de integracion de rutas con Supertest.

```bash
cd backend
npm run typecheck       # tsc --noEmit
npm run test            # ejecuta la suite
npm run test:coverage   # con reporte de cobertura (genera coverage/lcov.info)
npm run build           # compila a dist/ (usado por el Dockerfile)
```

**Frontend (Vitest + @vue/test-utils)** — 17 tests: componentes (`AlertMessage`, `FileDropZone`, `UploadResultModal`), store de autenticacion (Pinia, con axios mockeado) y la utilidad de reconstruccion de CSV con errores.

```bash
cd frontend
npm run typecheck       # vue-tsc --noEmit
npm run test
npm run test:coverage   # genera coverage/lcov.info
npm run build           # typecheck + build de produccion (vite build)
```

## Analisis de calidad con SonarQube (local)

1. Levantar SonarQube (stack aislado, no interfiere con la app):

   ```bash
   docker compose -f docker-compose.sonar.yml up -d
   ```

   Espera 1-2 minutos y entra a `http://localhost:9000` (usuario/clave iniciales `admin` / `admin`; pide cambiarla en el primer login).

2. Generar un token: `My Account > Security > Generate Token`.

3. Generar los reportes de cobertura (Sonar los lee en formato `lcov`):

   ```bash
   cd backend && npm run test:coverage && cd ..
   cd frontend && npm run test:coverage && cd ..
   ```

4. Ejecutar el analisis (usando el `sonar-scanner-cli` en Docker, sin instalar nada localmente):

   ```bash
   docker run --rm \
     -e SONAR_HOST_URL="http://host.docker.internal:9000" \
     -e SONAR_TOKEN="<TU_TOKEN>" \
     -v "$(pwd):/usr/src" \
     sonarsource/sonar-scanner-cli
   ```

   La configuracion del proyecto (fuentes, tests, exclusiones y rutas de cobertura) esta en [`sonar-project.properties`](sonar-project.properties).

5. Revisar el resultado en `http://localhost:9000/dashboard?id=csv-manager`.

Para detener SonarQube: `docker compose -f docker-compose.sonar.yml down` (agregar `-v` si tambien se quiere borrar el volumen de datos).
