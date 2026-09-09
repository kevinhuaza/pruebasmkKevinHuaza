jest.mock('../../../src/models', () => ({
  User: {
    findOne: jest.fn(),
    create: jest.fn(),
    count: jest.fn(),
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
  count: jest.Mock;
};
const mockedBcrypt = bcrypt as unknown as { hash: jest.Mock; compare: jest.Mock };

describe('auth.service', () => {
  describe('register', () => {
    it('crea el primer usuario del sistema con el rol solicitado (bootstrap)', async () => {
      mockedUser.findOne.mockResolvedValue(null);
      mockedUser.count.mockResolvedValue(0);
      mockedBcrypt.hash.mockResolvedValue('hashed_password');
      mockedUser.create.mockResolvedValue({ id: 1, username: 'admin', role: 'admin' });

      const result = await authService.register({
        username: 'admin',
        password: 'secret123',
        role: 'admin',
      });

      expect(mockedUser.create).toHaveBeenCalledWith({
        username: 'admin',
        password: 'hashed_password',
        role: 'admin',
      });
      expect(result).toEqual({ id: 1, username: 'admin', role: 'admin' });
    });

    it('ignora el rol pedido y crea "user" si ya existe al menos un usuario', async () => {
      mockedUser.findOne.mockResolvedValue(null);
      mockedUser.count.mockResolvedValue(1);
      mockedBcrypt.hash.mockResolvedValue('hashed_password');
      mockedUser.create.mockResolvedValue({ id: 2, username: 'juan', role: 'user' });

      const result = await authService.register({
        username: 'juan',
        password: 'secret123',
        role: 'admin', // intenta autoasignarse admin
      });

      expect(mockedUser.create).toHaveBeenCalledWith({
        username: 'juan',
        password: 'hashed_password',
        role: 'user', // se ignora, el alta publica de admins esta cerrada
      });
      expect(result.role).toBe('user');
    });

    it('lanza un conflicto 409 si el nombre de usuario ya existe', async () => {
      mockedUser.findOne.mockResolvedValue({ id: 1, username: 'juan' });

      await expect(
        authService.register({ username: 'juan', password: 'secret123', role: 'user' })
      ).rejects.toMatchObject({ statusCode: 409 });

      expect(mockedUser.create).not.toHaveBeenCalled();
    });
  });

  describe('login', () => {
    it('retorna un token y los datos del usuario con credenciales correctas', async () => {
      mockedUser.findOne.mockResolvedValue({
        id: 1,
        username: 'juan',
        role: 'admin',
        password: 'hashed_password',
      });
      mockedBcrypt.compare.mockResolvedValue(true);

      const result = await authService.login({ username: 'juan', password: 'secret123' });

      expect(result.user).toEqual({ id: 1, username: 'juan', role: 'admin' });
      expect(typeof result.token).toBe('string');
    });

    it('rechaza con 401 si el usuario no existe', async () => {
      mockedUser.findOne.mockResolvedValue(null);

      await expect(
        authService.login({ username: 'inexistente', password: 'secret123' })
      ).rejects.toMatchObject({ statusCode: 401 });
    });

    it('rechaza con 401 si la contrasena no coincide', async () => {
      mockedUser.findOne.mockResolvedValue({ id: 1, username: 'juan', password: 'hashed_password' });
      mockedBcrypt.compare.mockResolvedValue(false);

      await expect(
        authService.login({ username: 'juan', password: 'incorrecta' })
      ).rejects.toBeInstanceOf(ApiError);
    });
  });
});
