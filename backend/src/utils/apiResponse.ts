import { Response } from 'express';

export interface PaginationMeta {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPrevPage: boolean;
}

export function sendSuccess<T>(
  res: Response,
  data: T,
  statusCode = 200,
  pagination?: PaginationMeta,
  cached = false
): Response {
  if (cached) {
    res.setHeader('X-Cache', 'HIT');
  } else {
    res.setHeader('X-Cache', 'MISS');
  }

  const payload: { success: boolean; data: T; pagination?: PaginationMeta; cached?: boolean } = {
    success: true,
    data,
  };

  if (pagination) {
    payload.pagination = pagination;
  }

  if (cached !== undefined) {
    payload.cached = cached;
  }

  return res.status(statusCode).json(payload);
}

export function sendError(
  res: Response,
  message: string,
  statusCode = 400,
  code?: string,
  details?: any
): Response {
  return res.status(statusCode).json({
    success: false,
    error: {
      message,
      ...(code ? { code } : {}),
      ...(details ? { details } : {}),
    },
  });
}
