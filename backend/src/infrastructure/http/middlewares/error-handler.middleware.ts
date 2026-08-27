import { Request, Response, NextFunction } from 'express';
import { DomainError } from '../../../domain/errors/domain.error';
import { env } from '../../config/env';

export const errorHandler = (
  err: Error,
  _req: Request,
  res: Response,
  _next: NextFunction
): void => {
  // Domain-level known business exceptions
  if (err instanceof DomainError) {
    res.status(err.statusCode).json({
      error: err.message,
      errorCode: err.errorCode,
    });
    return;
  }

  // Log unexpected errors
  console.error('Unhandled Application Exception:', err);

  res.status(500).json({
    error: 'Internal Server Error',
    errorCode: 'INTERNAL_SERVER_ERROR',
    message: env.NODE_ENV === 'development' ? err.message : undefined,
  });
};
