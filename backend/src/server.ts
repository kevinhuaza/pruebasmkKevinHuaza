import app from './app';
import env from './config/env';
import { sequelize, connectWithRetry } from './config/database';
import { ensureBucketExists } from './services/storage.service';
import { ensureTemplateExists } from './services/template.service';
import './models';

async function start(): Promise<void> {
  await connectWithRetry();
  await sequelize.sync();
  console.log('Modelos sincronizados con la base de datos.');

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
