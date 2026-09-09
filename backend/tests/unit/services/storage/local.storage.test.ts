jest.mock('node:fs', () => ({
  promises: {
    mkdir: jest.fn(),
    writeFile: jest.fn(),
    access: jest.fn(),
    rm: jest.fn(),
  },
  createReadStream: jest.fn(),
  constants: { R_OK: 4 },
}));

import fs from 'node:fs';
import { localStorageDriver } from '../../../../src/services/storage/local.storage';
import ApiError from '../../../../src/utils/ApiError';

const mockedFs = fs as unknown as {
  promises: {
    mkdir: jest.Mock;
    writeFile: jest.Mock;
    access: jest.Mock;
    rm: jest.Mock;
  };
  createReadStream: jest.Mock;
};

describe('storage/local.storage', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('ensureReady', () => {
    it('crea el directorio raiz de uploads', async () => {
      mockedFs.promises.mkdir.mockResolvedValue(undefined);

      await localStorageDriver.ensureReady();

      expect(mockedFs.promises.mkdir).toHaveBeenCalledWith(
        expect.stringContaining('uploads'),
        { recursive: true }
      );
    });
  });

  describe('uploadObject', () => {
    it('crea el subdirectorio y escribe el archivo', async () => {
      mockedFs.promises.mkdir.mockResolvedValue(undefined);
      mockedFs.promises.writeFile.mockResolvedValue(undefined);

      await localStorageDriver.uploadObject('documents/a.csv', Buffer.from('data'), 'text/csv');

      expect(mockedFs.promises.mkdir).toHaveBeenCalledWith(
        expect.stringContaining('documents'),
        { recursive: true }
      );
      expect(mockedFs.promises.writeFile).toHaveBeenCalledWith(
        expect.stringContaining('a.csv'),
        Buffer.from('data')
      );
    });
  });

  describe('getObjectStream', () => {
    it('retorna un read stream cuando el archivo existe', async () => {
      mockedFs.promises.access.mockResolvedValue(undefined);
      const fakeStream = { pipe: jest.fn() };
      mockedFs.createReadStream.mockReturnValue(fakeStream);

      const result = await localStorageDriver.getObjectStream('documents/a.csv');

      expect(result).toBe(fakeStream);
    });

    it('lanza 404 cuando el archivo no existe', async () => {
      mockedFs.promises.access.mockRejectedValue(new Error('ENOENT'));

      await expect(localStorageDriver.getObjectStream('documents/missing.csv')).rejects.toBeInstanceOf(
        ApiError
      );
    });
  });

  describe('deleteObject', () => {
    it('borra el archivo sin fallar si ya no existe (force)', async () => {
      mockedFs.promises.rm.mockResolvedValue(undefined);

      await localStorageDriver.deleteObject('documents/a.csv');

      expect(mockedFs.promises.rm).toHaveBeenCalledWith(
        expect.stringContaining('a.csv'),
        { force: true }
      );
    });
  });

  describe('objectExists', () => {
    it('retorna true si el archivo es accesible', async () => {
      mockedFs.promises.access.mockResolvedValue(undefined);
      await expect(localStorageDriver.objectExists('documents/a.csv')).resolves.toBe(true);
    });

    it('retorna false si el archivo no es accesible', async () => {
      mockedFs.promises.access.mockRejectedValue(new Error('ENOENT'));
      await expect(localStorageDriver.objectExists('documents/a.csv')).resolves.toBe(false);
    });
  });
});
