import { NextFunction, Request, Response } from 'express';
import { verifyToken } from '../utils/jwt';
import ApiError from '../utils/ApiError';
import catchAsync from '../utils/catchAsync';
import { User } from '../models';

const authenticate = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
  const authHeader = req.headers.authorization || '';
  const [scheme, token] = authHeader.split(' ');

  if (scheme !== 'Bearer' || !token) {
    throw ApiError.unauthorized('Token no proporcionado');
  }

  let payload;
  try {
    payload = verifyToken(token);
  } catch (error) {
    throw ApiError.unauthorized('Token invalido o expirado');
  }

  const user = await User.findByPk(payload.sub, {
    attributes: ['id', 'username', 'role'],
  });

  if (!user) {
    throw ApiError.unauthorized('El usuario asociado al token ya no existe');
  }

  req.user = { id: user.id, username: user.username, role: user.role };
  next();
});

export default authenticate;
