import { Request, Response } from 'express';
import { validationResult } from 'express-validator';
import catchAsync from '../utils/catchAsync';
import ApiError from '../utils/ApiError';
import * as authService from '../services/auth.service';

function checkValidation(req: Request): void {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    throw ApiError.badRequest(
      'Datos de entrada invalidos',
      errors.array().map((e) => ({ field: (e as { path?: string }).path, message: e.msg }))
    );
  }
}

export const register = catchAsync(async (req: Request, res: Response) => {
  checkValidation(req);
  const { nombre, password, rol } = req.body;
  const user = await authService.register({ nombre, password, rol });
  res.status(201).json({ success: true, data: user });
});

export const login = catchAsync(async (req: Request, res: Response) => {
  checkValidation(req);
  const { nombre, password } = req.body;
  const result = await authService.login({ nombre, password });
  res.status(200).json({ success: true, data: result });
});
