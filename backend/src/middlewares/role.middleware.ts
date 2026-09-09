import { NextFunction, Request, Response } from 'express';
import ApiError from '../utils/ApiError';
import { UserRole } from '../models/user.model';

export default function authorize(...allowedRoles: UserRole[]) {
  return (req: Request, res: Response, next: NextFunction): void => {
    if (!req.user) {
      next(ApiError.unauthorized());
      return;
    }
    if (!allowedRoles.includes(req.user.role)) {
      next(ApiError.forbidden('No tienes permisos para realizar esta accion'));
      return;
    }
    next();
  };
}
