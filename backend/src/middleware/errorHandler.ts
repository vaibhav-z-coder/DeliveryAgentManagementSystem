import { Request, Response, NextFunction } from 'express';
import { AppError } from '../utils/errors';
import { sendError } from '../utils/apiResponse';
import { Prisma } from '@prisma/client';

export function errorHandler(
  err: Error,
  _req: Request,
  res: Response,
  _next: NextFunction
): void {
  // 1. Handle Known AppError
  if (err instanceof AppError) {
    sendError(res, err.message, err.statusCode, err.code, err.details);
    return;
  }

  // 2. Handle Prisma Unique Constraint Violation
  if (err instanceof Prisma.PrismaClientKnownRequestError) {
    if (err.code === 'P2002') {
      const target = Array.isArray(err.meta?.target) ? err.meta.target.join(', ') : 'field';
      sendError(
        res,
        `A record with this ${target} already exists`,
        409,
        'DUPLICATE_ENTRY',
        { fields: err.meta?.target }
      );
      return;
    }

    if (err.code === 'P2025') {
      sendError(res, 'Record not found', 404, 'NOT_FOUND');
      return;
    }

    console.error('[Prisma Error]:', err.code, err.message);
    sendError(res, 'Database operation failed', 500, 'DATABASE_ERROR');
    return;
  }

  // 3. Fallback for unhandled server errors
  console.error('[Unhandled Internal Error]:', err);
  sendError(res, 'Internal server error', 500, 'INTERNAL_SERVER_ERROR');
}

export function notFoundHandler(req: Request, res: Response): void {
  sendError(res, `Route ${req.method} ${req.originalUrl} not found`, 404, 'ROUTE_NOT_FOUND');
}
