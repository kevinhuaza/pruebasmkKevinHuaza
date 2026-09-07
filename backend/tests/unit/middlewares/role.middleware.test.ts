import { Request, Response } from 'express';
import authorize from '../../../src/middlewares/role.middleware';

describe('role.middleware (RBAC)', () => {
  function mockRes(): Response {
    return {} as Response;
  }

  it('llama a next() sin argumentos cuando el rol esta permitido', () => {
    const req = { user: { id: 1, nombre: 'admin', rol: 'admin' } } as unknown as Request;
    const next = jest.fn();

    authorize('admin')(req, mockRes(), next);

    expect(next).toHaveBeenCalledWith();
  });

  it('llama a next(error 403) cuando el rol no esta permitido', () => {
    const req = { user: { id: 2, nombre: 'user', rol: 'user' } } as unknown as Request;
    const next = jest.fn();

    authorize('admin')(req, mockRes(), next);

    expect(next).toHaveBeenCalledTimes(1);
    const errorArg = next.mock.calls[0][0];
    expect(errorArg.statusCode).toBe(403);
  });

  it('llama a next(error 401) cuando no hay usuario autenticado', () => {
    const req = {} as Request;
    const next = jest.fn();

    authorize('admin')(req, mockRes(), next);

    const errorArg = next.mock.calls[0][0];
    expect(errorArg.statusCode).toBe(401);
  });

  it('permite multiples roles autorizados', () => {
    const req = { user: { id: 3, nombre: 'user', rol: 'user' } } as unknown as Request;
    const next = jest.fn();

    authorize('user', 'admin')(req, mockRes(), next);

    expect(next).toHaveBeenCalledWith();
  });
});
