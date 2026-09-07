jest.mock('../../src/services/auth.service');

import request from 'supertest';
import * as authService from '../../src/services/auth.service';
import ApiError from '../../src/utils/ApiError';
import app from '../../src/app';

const mockedAuthService = authService as jest.Mocked<typeof authService>;

describe('POST /api/auth/register', () => {
  it('retorna 400 si las contrasenas no coinciden', async () => {
    const res = await request(app).post('/api/auth/register').send({
      nombre: 'juan',
      password: 'secret123',
      confirmarContrasena: 'otra123',
      rol: 'user',
    });

    expect(res.status).toBe(400);
    expect(res.body.success).toBe(false);
    expect(res.body.details).toEqual(
      expect.arrayContaining([expect.objectContaining({ field: 'confirmarContrasena' })])
    );
    expect(mockedAuthService.register).not.toHaveBeenCalled();
  });

  it('retorna 400 si el rol no es valido', async () => {
    const res = await request(app).post('/api/auth/register').send({
      nombre: 'juan',
      password: 'secret123',
      confirmarContrasena: 'secret123',
      rol: 'superadmin',
    });

    expect(res.status).toBe(400);
  });

  it('retorna 201 y delega en el servicio cuando los datos son validos', async () => {
    mockedAuthService.register.mockResolvedValue({ id: 1, nombre: 'juan', rol: 'user' });

    const res = await request(app).post('/api/auth/register').send({
      nombre: 'juan',
      password: 'secret123',
      confirmarContrasena: 'secret123',
      rol: 'user',
    });

    expect(res.status).toBe(201);
    expect(res.body.data).toEqual({ id: 1, nombre: 'juan', rol: 'user' });
  });
});

describe('POST /api/auth/login', () => {
  it('retorna 400 si falta el nombre de usuario', async () => {
    const res = await request(app).post('/api/auth/login').send({ password: 'secret123' });
    expect(res.status).toBe(400);
    expect(mockedAuthService.login).not.toHaveBeenCalled();
  });

  it('retorna 401 cuando el servicio rechaza las credenciales', async () => {
    mockedAuthService.login.mockRejectedValue(ApiError.unauthorized('Credenciales invalidas'));

    const res = await request(app)
      .post('/api/auth/login')
      .send({ nombre: 'juan', password: 'incorrecta' });

    expect(res.status).toBe(401);
    expect(res.body.success).toBe(false);
  });

  it('retorna 200 con token cuando las credenciales son correctas', async () => {
    mockedAuthService.login.mockResolvedValue({
      token: 'jwt-token',
      user: { id: 1, nombre: 'juan', rol: 'user' },
    });

    const res = await request(app)
      .post('/api/auth/login')
      .send({ nombre: 'juan', password: 'secret123' });

    expect(res.status).toBe(200);
    expect(res.body.data.token).toBe('jwt-token');
  });
});
