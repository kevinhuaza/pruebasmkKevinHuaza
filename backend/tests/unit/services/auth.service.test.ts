jest.mock('../../../src/models', () => ({
  User: {
    findOne: jest.fn(),
    create: jest.fn(),
  },
}));
jest.mock('bcryptjs', () => ({
  hash: jest.fn(),
  compare: jest.fn(),
}));

import bcrypt from 'bcryptjs';
import { User } from '../../../src/models';
import * as authService from '../../../src/services/auth.service';
import ApiError from '../../../src/utils/ApiError';

const mockedUser = User as unknown as {
  findOne: jest.Mock;
  create: jest.Mock;
};
const mockedBcrypt = bcrypt as unknown as { hash: jest.Mock; compare: jest.Mock };

describe('auth.service', () => {
  describe('register', () => {
    it('crea un usuario nuevo con la contrasena hasheada', async () => {
      mockedUser.findOne.mockResolvedValue(null);
      mockedBcrypt.hash.mockResolvedValue('hashed_password');
      mockedUser.create.mockResolvedValue({ id: 1, nombre: 'juan', rol: 'user' });

      const result = await authService.register({
        nombre: 'juan',
        password: 'secret123',
        rol: 'user',
      });

      expect(mockedBcrypt.hash).toHaveBeenCalledWith('secret123', 12);
      expect(mockedUser.create).toHaveBeenCalledWith({
        nombre: 'juan',
        password: 'hashed_password',
        rol: 'user',
      });
      expect(result).toEqual({ id: 1, nombre: 'juan', rol: 'user' });
    });

    it('lanza un conflicto 409 si el nombre de usuario ya existe', async () => {
      mockedUser.findOne.mockResolvedValue({ id: 1, nombre: 'juan' });

      await expect(
        authService.register({ nombre: 'juan', password: 'secret123', rol: 'user' })
      ).rejects.toMatchObject({ statusCode: 409 });

      expect(mockedUser.create).not.toHaveBeenCalled();
    });
  });

  describe('login', () => {
    it('retorna un token y los datos del usuario con credenciales correctas', async () => {
      mockedUser.findOne.mockResolvedValue({
        id: 1,
        nombre: 'juan',
        rol: 'admin',
        password: 'hashed_password',
      });
      mockedBcrypt.compare.mockResolvedValue(true);

      const result = await authService.login({ nombre: 'juan', password: 'secret123' });

      expect(result.user).toEqual({ id: 1, nombre: 'juan', rol: 'admin' });
      expect(typeof result.token).toBe('string');
    });

    it('rechaza con 401 si el usuario no existe', async () => {
      mockedUser.findOne.mockResolvedValue(null);

      await expect(
        authService.login({ nombre: 'inexistente', password: 'secret123' })
      ).rejects.toMatchObject({ statusCode: 401 });
    });

    it('rechaza con 401 si la contrasena no coincide', async () => {
      mockedUser.findOne.mockResolvedValue({ id: 1, nombre: 'juan', password: 'hashed_password' });
      mockedBcrypt.compare.mockResolvedValue(false);

      await expect(
        authService.login({ nombre: 'juan', password: 'incorrecta' })
      ).rejects.toBeInstanceOf(ApiError);
    });
  });
});
