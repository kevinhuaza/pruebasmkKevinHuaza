export class ApiError extends Error {
  statusCode: number;
  details: unknown;
  isOperational: boolean;

  constructor(statusCode: number, message: string, details: unknown = null) {
    super(message);
    this.statusCode = statusCode;
    this.details = details;
    this.isOperational = true;
    Error.captureStackTrace(this, this.constructor);
  }

  static badRequest(message: string, details: unknown = null): ApiError {
    return new ApiError(400, message, details);
  }

  static unauthorized(message = 'No autorizado'): ApiError {
    return new ApiError(401, message);
  }

  static forbidden(message = 'Acceso denegado'): ApiError {
    return new ApiError(403, message);
  }

  static notFound(message = 'Recurso no encontrado'): ApiError {
    return new ApiError(404, message);
  }

  static conflict(message: string): ApiError {
    return new ApiError(409, message);
  }

  static unprocessable(message: string, details: unknown = null): ApiError {
    return new ApiError(422, message, details);
  }

  static internal(message = 'Error interno del servidor'): ApiError {
    return new ApiError(500, message);
  }
}

export default ApiError;
