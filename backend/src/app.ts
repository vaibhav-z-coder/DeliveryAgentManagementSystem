import express, { Express } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import agentRoutes from './routes/agentRoutes';
import healthRoutes from './routes/healthRoutes';
import { errorHandler, notFoundHandler } from './middleware/errorHandler';
import { env } from './config/env';

export function createApp(): Express {
  const app = express();

  // Security headers
  app.use(helmet());

  // CORS configuration — open to all origins for public API access
  app.use(
    cors({
      origin: '*',
      methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
      allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
    })
  );

  // Request logger (in non-test environments)
  if (env.NODE_ENV !== 'test') {
    app.use(morgan('dev'));
  }

  // Body parsers
  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));

  // API Routes
  app.use('/api', healthRoutes);
  app.use('/api/agents', agentRoutes);

  // 404 Handler
  app.use(notFoundHandler);

  // Centralized Error Handler
  app.use(errorHandler);

  return app;
}

export const app = createApp();
