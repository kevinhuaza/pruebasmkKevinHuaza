import app from './app';
import env from './config/env';
import { connectWithRetry } from './config/database';
import { ensureBucketExists } from './services/storage.service';
import { ensureTemplateExists } from './services/template.service';
import './models';

async function start(): Promise<void> {
  await connectWithRetry();
  // El esquema lo crean las migraciones versionadas (backend/migrations),
  // no sequelize.sync(). En Docker corren solas al arrancar el contenedor
  // (ver Dockerfile); en desarrollo local: npm run migrate.

  await ensureBucketExists();
  await ensureTemplateExists();

  app.listen(env.port, () => {
    console.log(`Servidor escuchando en el puerto ${env.port} (${env.nodeEnv})`);
  });
}

start().catch((error) => {
  console.error('No se pudo iniciar el servidor:', error);
  process.exit(1);
});
