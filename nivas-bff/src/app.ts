import cors from 'cors';
import express from 'express';
import helmet from 'helmet';
import morgan from 'morgan';
import { env } from './config/env.js';
import { errorHandler } from './middleware/errorHandler.js';
import { healthRouter } from './routes/health.routes.js';
import { meRouter } from './routes/me.routes.js';
import { complaintsRouter } from './routes/complaints.routes.js';
import { wardsRouter } from './routes/wards.routes.js';
import { housingRouter } from './routes/housing.routes.js';
import { documentsRouter } from './routes/documents.routes.js';
import { notificationsRouter } from './routes/notifications.routes.js';

export function createApp(): express.Express {
  const app = express();

  app.use(helmet());
  app.use(cors({ origin: env.FRONTEND_ORIGIN, credentials: true }));
  app.use(express.json({ limit: '10mb' }));
  app.use(express.urlencoded({ extended: true }));
  app.use(morgan(env.NODE_ENV === 'production' ? 'combined' : 'dev'));

  app.use('/api/health', healthRouter);
  app.use('/api/me', meRouter);
  app.use('/api/complaints', complaintsRouter);
  app.use('/api/wards', wardsRouter);
  app.use('/api/housing', housingRouter);
  app.use('/api/documents', documentsRouter);
  app.use('/api/notifications', notificationsRouter);

  app.use(errorHandler);

  return app;
}
