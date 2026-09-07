import jwt, { SignOptions } from 'jsonwebtoken';
import env from '../config/env';

export interface JwtPayload {
  sub: number;
  rol: 'user' | 'admin';
}

export function signToken(payload: JwtPayload): string {
  return jwt.sign(payload, env.jwt.secret, {
    expiresIn: env.jwt.expiresIn,
  } as SignOptions);
}

export function verifyToken(token: string): JwtPayload {
  return jwt.verify(token, env.jwt.secret) as unknown as JwtPayload;
}
