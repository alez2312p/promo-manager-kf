import { Router, Request, Response } from 'express';
import { prisma } from '../infrastructure/database/prisma';

export const healthRouter = Router();

/**
 * GET /health
 * Performs an active connectivity check against PostgreSQL through Prisma.
 * Returns:
 *   - 200: { status: 'ok', db: 'connected' }
 *   - 503: { status: 'error', db: 'disconnected' }
 */
healthRouter.get('/', async (_req: Request, res: Response) => {
  try {
    // Perform raw query to verify real PostgreSQL connectivity
    await prisma.$queryRaw`SELECT 1`;
    return res.status(200).json({
      status: 'ok',
      db: 'connected',
    });
  } catch (error) {
    console.error('Database health check failed:', error);
    return res.status(503).json({
      status: 'error',
      db: 'disconnected',
    });
  }
});
