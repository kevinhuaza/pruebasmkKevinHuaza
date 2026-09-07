import { NextFunction, Request, Response } from 'express';
import ApiError from '../utils/ApiError';
import env from '../config/env';

export function notFoundHandler(req: Request, res: Response, next: NextFunction): void {
  next(ApiError.notFound(`Ruta no encontrada: ${req.method} ${req.originalUrl}`));
}

interface SequelizeLikeError extends Error {
  errors?: Array<{ path: string; message: string }>;
}

export function errorHandler(
  err: Error,
  req: Request,
  res: Response,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  next: NextFunction
): void {
  let error: ApiError;

  if (err instanceof ApiError) {
    error = err;
  } else if (err.name === 'MulterError') {
    error = ApiError.badRequest(`Error al subir el archivo: ${err.message}`);
  } else if (err.name === 'SequelizeValidationError' || err.name === 'SequelizeUniqueConstraintError') {
    const seqError = err as SequelizeLikeError;
    error = ApiError.badRequest(
      'Error de validacion',
      (seqError.errors || []).map((e) => ({ field: e.path, message: e.message }))
    );
  } else {
    const statusCode = (err as { statusCode?: number }).statusCode || 500;
    error = new ApiError(statusCode, err.message || 'Error interno del servidor');
  }

  const response: Record<string, unknown> = {
    success: false,
    message: error.message,
    ...(error.details ? { details: error.details } : {}),
  };

  if (env.nodeEnv === 'development' && error.statusCode === 500) {
    response.stack = err.stack;
  }

  if (error.statusCode === 500) {
    console.error(err);
  }

  res.status(error.statusCode).json(response);
}
