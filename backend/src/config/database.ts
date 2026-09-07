import { Sequelize } from 'sequelize';
import env from './env';

const sequelize = new Sequelize(env.db.name, env.db.user, env.db.password, {
  host: env.db.host,
  port: env.db.port,
  dialect: 'postgres',
  logging: env.nodeEnv === 'development' ? console.log : false,
  define: {
    underscored: true,
  },
});

async function connectWithRetry(retries = 10, delayMs = 3000): Promise<void> {
  for (let attempt = 1; attempt <= retries; attempt += 1) {
    try {
      await sequelize.authenticate();
      console.log('Database connection established.');
      return;
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      console.warn(`DB connection attempt ${attempt}/${retries} failed: ${message}`);
      if (attempt === retries) throw error;
      await new Promise((resolve) => setTimeout(resolve, delayMs));
    }
  }
}

export { sequelize, connectWithRetry };
