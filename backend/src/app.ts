import express, { Application } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import swaggerUi from 'swagger-ui-express';
import env from './config/env';
import routes from './routes';
import swaggerSpec from './config/swagger';
import { notFoundHandler, errorHandler } from './middlewares/error.middleware';
import { generalLimiter } from './middlewares/rateLimit.middleware';

const app: Application = express();

app.disable('x-powered-by');
app.use(helmet());
app.use(
  cors({
    origin: env.cors.origin,
    credentials: true,
  })
);
app.use(express.json({ limit: '1mb' }));
app.use(express.urlencoded({ extended: true }));

if (env.nodeEnv !== 'test') {
  app.use(morgan(env.nodeEnv === 'development' ? 'dev' : 'combined'));
}

// Documentacion interactiva (Swagger UI). Se relaja el CSP solo aqui, ya que
// swagger-ui-express necesita inline styles/scripts para renderizar la UI.
app.use(
  '/api/docs',
  helmet({
    contentSecurityPolicy: {
      directives: {
        ...helmet.contentSecurityPolicy.getDefaultDirectives(),
        'script-src': ["'self'", "'unsafe-inline'"],
        'style-src': ["'self'", "'unsafe-inline'"],
        'img-src': ["'self'", 'data:'],
      },
    },
  }),
  swaggerUi.serve,
  swaggerUi.setup(swaggerSpec, { customSiteTitle: 'SMK - Gestor de Documentos CSV - API Docs' })
);

app.use('/api', generalLimiter, routes);

app.use(notFoundHandler);
app.use(errorHandler);

export default app;
