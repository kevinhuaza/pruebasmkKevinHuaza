import 'express';

export interface AuthenticatedUser {
  id: number;
  nombre: string;
  rol: 'user' | 'admin';
}

declare global {
  namespace Express {
    interface Request {
      user?: AuthenticatedUser;
    }
  }
}
