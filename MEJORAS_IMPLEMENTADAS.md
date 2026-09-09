# Mejoras Implementadas: Criterio Detrás de las Decisiones Tomadas

Este documento responde a la retroalimentación técnica recibida sobre la prueba, explicando qué se cambió, dónde está en el código, y el criterio detrás de cada decisión. Incluye también la trazabilidad del uso de IA como herramienta de apoyo durante el desarrollo.

---

## 1. Almacenamiento local y arranque con un solo comando

**Problema original:** `docker compose up` exigía una cuenta de AWS real y editar el `.env` a mano con credenciales y bucket antes de poder levantar el entorno.

**Solución:** El almacenamiento ya se guarda localmente por defecto. No se eliminó el soporte para AWS: se creó un parámetro (`STORAGE_DRIVER`, con valores `local` o `s3`) que decide en tiempo de ejecución dónde se guarda cada archivo.

**Dónde está en el código:**
- `backend/src/config/env.ts` (línea 78) — lee la variable de entorno `STORAGE_DRIVER`.
- `backend/src/services/storage.service.ts` (línea 6) — una sola línea elige el driver correspondiente:
  ```ts
  const driver = env.storage.driver === 's3' ? s3StorageDriver : localStorageDriver;
  ```
- `backend/src/services/storage/local.storage.ts` y `backend/src/services/storage/s3.storage.ts` — ambos implementan exactamente las mismas 4 funciones (`uploadObject`, `getObjectStream`, `deleteObject`, `ensureReady`), así que el resto de la aplicación nunca sabe ni le importa cuál de los dos está activo.

Con esto, clonar el repo y correr `docker compose up --build` alcanza para tener el entorno funcionando en local, sin ninguna dependencia externa.

---

## 2. Migraciones versionadas

**Problema original:** el esquema de la base de datos se generaba con `sequelize.sync()`, sin ningún registro de qué cambió, cuándo, ni en qué orden.

**Solución:** se reemplazó por migraciones versionadas (`backend/migrations/`). Cada cambio de esquema queda en su propio archivo, numerado en el orden en que debe aplicarse:

```
01.00.01-create-users.js
01.00.02-create-documents.js
01.00.03-create-records.js
01.00.04-add-index-documents-deleted-at.js
```

Cada migración define dos operaciones: `up` (aplicar el cambio) y `down` (deshacerlo). Al iniciar la aplicación, `sequelize-cli` revisa cuáles migraciones ya se ejecutaron (registro propio en la tabla `SequelizeMeta`) y corre únicamente las pendientes, en orden. Esto se ejecuta automáticamente dentro del contenedor Docker (`backend/Dockerfile`) antes de levantar el servidor, así que no se pierde la simplicidad de "un solo comando" — solo se gana trazabilidad y la posibilidad de revertir un cambio específico si hace falta.

---

## 3. Soft delete (borrado lógico)

**Problema original:** el borrado de un documento era físico (se eliminaba la fila de la base de datos) y además borraba el archivo del storage.

**Solución:** se creó una bandera en la base de datos, el campo `deleted_at`. Si este campo contiene una fecha, el documento se considera eliminado y no se muestra en el listado; si está vacío (`null`), sigue activo y se muestra con normalidad. El archivo en el storage ya no se toca al eliminar — se conserva.

Implementado con `paranoid: true` en el modelo `Document`, que hace que Sequelize convierta automáticamente cada `destroy()` en un `UPDATE deleted_at = NOW()` en vez de un `DELETE`, y filtre solo las filas activas en cada consulta (`findAll`, `findByPk`) sin tener que repetir esa condición a mano en cada lugar del código.

---

## 4. Nomenclatura en inglés

**Problema original:** la capa de servicios estaba en inglés, pero los atributos seguían en español y mezclados (`nombreOriginal`, `usuarioId`, `rutaArchivo`, y `fecha_carga` en snake_case entre campos camelCase).

**Solución:** la nomenclatura se unificó a inglés en todo el proyecto (modelos, servicios, API, frontend): `username`, `role`, `originalName`, `storageKey`, `recordCount`, `userId`, `uploadedAt`, `uploadedBy`, etc.

Se dejaron en español únicamente los campos del CSV que define el enunciado de la prueba (`correo`, `nombre`, `telefono`, `ciudad`, `notas`), ya que ese es el formato de archivo exacto que el enunciado exige. Esto incluye también la tabla `records` (las filas del CSV ya procesadas), que ahora guarda `email`, `fullName`, `phone`, `city`, `notes` — el archivo que sube el usuario se sigue validando con las columnas en español, y la traducción ocurre en un único lugar (`backend/src/validators/csvRow.validator.ts`), justo en la frontera entre el formato de archivo externo y el modelo interno.

---

## 5. Registro de administradores

**Problema original:** el formulario de registro permitía crearse como `admin` sin ninguna restricción del lado del servidor.

**Solución:** implementé la regla de que solo el primer usuario que se registra en el sistema queda con rol `admin`, y los demás quedan con rol `user`. Esto lo hice para que puedan probar la aplicación con diferentes roles. El selector de rol se mantiene en el formulario (según lo solicitado), pero el backend ignora ese valor para cualquier registro posterior al primero.

En un entorno real, este control de roles lo manejaría integrando un proveedor de identidad externo, como Active Directory de Microsoft, en vez de manejarlo dentro del propio registro de la aplicación.

---

## 6. Trazabilidad del uso de IA

Utilicé IA como apoyo en varios momentos puntuales del desarrollo, siempre validando el resultado antes de aplicarlo:

- **Soft delete:** consulté ideas de implementación; mi propuesta inicial (una bandera de fecha `deleted_at`, nula si está activo) coincidió con la sugerencia de la IA, así que la usé como confirmación del enfoque.
- **Migraciones:** tuve un problema donde los cambios nuevos del modelo no se reflejaban al crear una migración; la IA me ayudó a diagnosticarlo y corregirlo.
- **Tests:** los tests nuevos agregados junto con estos cambios (migraciones, borrado lógico, nomenclatura) los generé con apoyo de IA, revisando que cubrieran los casos reales antes de incluirlos.
- **Copilot:** además, usé GitHub Copilot como autocompletado mientras escribía código, para acelerar patrones repetitivos y recibir sugerencias en línea, revisando siempre lo aceptado.

El versionamiento de todas estas modificaciones queda registrado en el historial de commits del repositorio, en la rama `feature/local-storage`.
