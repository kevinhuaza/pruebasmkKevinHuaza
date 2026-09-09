const mockSend = jest.fn();

jest.mock('@aws-sdk/client-s3', () => {
  class FakeCommand {
    input: unknown;
    constructor(input: unknown) {
      this.input = input;
    }
  }
  return {
    S3Client: jest.fn().mockImplementation(() => ({ send: mockSend })),
    PutObjectCommand: FakeCommand,
    GetObjectCommand: FakeCommand,
    DeleteObjectCommand: FakeCommand,
    HeadBucketCommand: FakeCommand,
    CreateBucketCommand: FakeCommand,
    HeadObjectCommand: FakeCommand,
  };
});

import { s3StorageDriver } from '../../../../src/services/storage/s3.storage';
import ApiError from '../../../../src/utils/ApiError';

describe('storage/s3.storage', () => {
  beforeEach(() => {
    mockSend.mockReset();
  });

  describe('uploadObject', () => {
    it('envia un PutObjectCommand con el bucket, key, body y content-type', async () => {
      mockSend.mockResolvedValue({});

      await s3StorageDriver.uploadObject('documents/a.csv', Buffer.from('data'), 'text/csv');

      expect(mockSend).toHaveBeenCalledTimes(1);
      const command = mockSend.mock.calls[0][0];
      expect(command.input).toMatchObject({ Key: 'documents/a.csv', ContentType: 'text/csv' });
    });
  });

  describe('getObjectStream', () => {
    it('retorna el Body del objeto cuando existe', async () => {
      const fakeStream = { pipe: jest.fn() };
      mockSend.mockResolvedValue({ Body: fakeStream });

      const result = await s3StorageDriver.getObjectStream('documents/a.csv');

      expect(result).toBe(fakeStream);
    });

    it('lanza 404 cuando el objeto no existe (NoSuchKey)', async () => {
      mockSend.mockRejectedValue(Object.assign(new Error('not found'), { name: 'NoSuchKey' }));

      await expect(s3StorageDriver.getObjectStream('documents/missing.csv')).rejects.toBeInstanceOf(
        ApiError
      );
    });

    it('propaga otros errores tal cual', async () => {
      const otherError = Object.assign(new Error('boom'), { name: 'InternalError' });
      mockSend.mockRejectedValue(otherError);

      await expect(s3StorageDriver.getObjectStream('documents/a.csv')).rejects.toBe(otherError);
    });
  });

  describe('deleteObject', () => {
    it('envia un DeleteObjectCommand con el key', async () => {
      mockSend.mockResolvedValue({});

      await s3StorageDriver.deleteObject('documents/a.csv');

      const command = mockSend.mock.calls[0][0];
      expect(command.input).toMatchObject({ Key: 'documents/a.csv' });
    });
  });

  describe('objectExists', () => {
    it('retorna true cuando HeadObject responde sin error', async () => {
      mockSend.mockResolvedValueOnce({});
      await expect(s3StorageDriver.objectExists('documents/a.csv')).resolves.toBe(true);
    });

    it('retorna false cuando HeadObject falla', async () => {
      mockSend.mockRejectedValueOnce(new Error('not found'));
      await expect(s3StorageDriver.objectExists('documents/a.csv')).resolves.toBe(false);
    });
  });

  describe('ensureReady', () => {
    it('no crea el bucket si HeadBucket confirma que ya existe', async () => {
      mockSend.mockResolvedValueOnce({});

      await s3StorageDriver.ensureReady();

      expect(mockSend).toHaveBeenCalledTimes(1);
    });

    it('crea el bucket si HeadBucket falla', async () => {
      mockSend.mockRejectedValueOnce(new Error('not found')).mockResolvedValueOnce({});

      await s3StorageDriver.ensureReady();

      expect(mockSend).toHaveBeenCalledTimes(2);
    });
  });
});
