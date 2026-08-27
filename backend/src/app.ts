import express, { Express, Request, Response } from 'express';
import cors from 'cors';
import { env } from './config/env';
import { healthRouter } from './routes/health.router';
import { promotionRouter } from './infrastructure/http/routes/promotion.router';
import { errorHandler } from './infrastructure/http/middlewares/error-handler.middleware';

export const createApp = (): Express => {
  const app = express();

  // Configure CORS
  const allowedOrigins =
    env.CORS_ORIGIN === '*'
      ? '*'
      : env.CORS_ORIGIN.split(',').map((origin) => origin.trim());

  app.use(
    cors({
      origin: allowedOrigins,
      credentials: true,
    })
  );

  // Parse JSON payloads
  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));

  // Routes
  app.use('/health', healthRouter);
  app.use('/promotions', promotionRouter);

  // 404 Handler for unmatched routes
  app.use((_req: Request, res: Response) => {
    res.status(404).json({
      error: 'Endpoint not found',
      errorCode: 'NOT_FOUND',
    });
  });

  // Global Error Handler (maps DomainErrors to semantic HTTP status codes)
  app.use(errorHandler);

  return app;
};
