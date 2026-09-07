jest.mock('../../../src/services/csv.service');
jest.mock('../../../src/services/storage.service');
jest.mock('../../../src/models', () => {
  const transaction = jest.fn(async (callback: (t: unknown) => unknown) => callback({}));
  return {
    sequelize: { transaction },
    Document: {
      create: jest.fn(),
      findAll: jest.fn(),
      findByPk: jest.fn(),
    },
    Record: {
      bulkCreate: jest.fn(),
    },
    User: {},
  };
});

import { parseAndValidateCsv } from '../../../src/services/csv.service';
import * as storageService from '../../../src/services/storage.service';
import { Document, Record } from '../../../src/models';
import * as documentService from '../../../src/services/document.service';

const mockedParse = parseAndValidateCsv as jest.Mock;
const mockedStorage = storageService as jest.Mocked<typeof storageService>;
const mockedDocument = Document as unknown as {
  create: jest.Mock;
  findAll: jest.Mock;
  findByPk: jest.Mock;
};
const mockedRecord = Record as unknown as { bulkCreate: jest.Mock };

describe('document.service', () => {
  const fakeFile = {
    buffer: Buffer.from('correo,nombre,telefono,ciudad\na@a.com,A,123,Lima\n'),
    originalname: 'clientes.csv',
  } as Express.Multer.File;

  describe('uploadDocument', () => {
    it('sube el CSV a S3 y guarda el documento y sus registros cuando es valido', async () => {
      mockedParse.mockReturnValue([
        { correo: 'a@a.com', nombre: 'A', telefono: '123', ciudad: 'Lima', notas: null },
      ]);
      mockedStorage.uploadObject.mockResolvedValue(undefined);
      mockedDocument.create.mockResolvedValue({ id: 10 });
      mockedDocument.findByPk.mockResolvedValue({ id: 10, nombreOriginal: 'clientes.csv' });

      const result = await documentService.uploadDocument({ file: fakeFile, userId: 7 });

      expect(mockedStorage.uploadObject).toHaveBeenCalledWith(
        expect.stringMatching(/^documents\/.+\.csv$/),
        fakeFile.buffer,
        'text/csv'
      );
      expect(mockedDocument.create).toHaveBeenCalledWith(
        expect.objectContaining({ nombreOriginal: 'clientes.csv', usuarioId: 7, numRegistros: 1 }),
        expect.anything()
      );
      expect(mockedRecord.bulkCreate).toHaveBeenCalledWith(
        [expect.objectContaining({ correo: 'a@a.com', documentId: 10 })],
        expect.anything()
      );
      expect(result).toEqual({ id: 10, nombreOriginal: 'clientes.csv' });
    });

    it('no sube nada a S3 si el CSV es invalido', async () => {
      const csvError = Object.assign(new Error('CSV invalido'), { statusCode: 422 });
      mockedParse.mockImplementation(() => {
        throw csvError;
      });

      await expect(documentService.uploadDocument({ file: fakeFile, userId: 7 })).rejects.toBe(
        csvError
      );

      expect(mockedStorage.uploadObject).not.toHaveBeenCalled();
      expect(mockedDocument.create).not.toHaveBeenCalled();
    });

    it('borra el objeto de S3 (compensacion) si la transaccion de BD falla', async () => {
      mockedParse.mockReturnValue([
        { correo: 'a@a.com', nombre: 'A', telefono: '123', ciudad: 'Lima', notas: null },
      ]);
      mockedStorage.uploadObject.mockResolvedValue(undefined);
      mockedStorage.deleteObject.mockResolvedValue(undefined);
      const dbError = new Error('DB caida');
      mockedDocument.create.mockRejectedValue(dbError);

      await expect(documentService.uploadDocument({ file: fakeFile, userId: 7 })).rejects.toBe(
        dbError
      );

      expect(mockedStorage.deleteObject).toHaveBeenCalledWith(
        expect.stringMatching(/^documents\/.+\.csv$/)
      );
    });
  });

  describe('deleteDocument', () => {
    it('lanza 404 si el documento no existe', async () => {
      mockedDocument.findByPk.mockResolvedValue(null);

      await expect(documentService.deleteDocument(999)).rejects.toMatchObject({
        statusCode: 404,
      });
    });

    it('destruye el documento y borra el objeto de S3', async () => {
      const destroy = jest.fn().mockResolvedValue(undefined);
      mockedDocument.findByPk.mockResolvedValue({
        id: 5,
        rutaArchivo: 'documents/x.csv',
        destroy,
      });
      mockedStorage.deleteObject.mockResolvedValue(undefined);

      await documentService.deleteDocument(5);

      expect(destroy).toHaveBeenCalled();
      expect(mockedStorage.deleteObject).toHaveBeenCalledWith('documents/x.csv');
    });
  });
});
