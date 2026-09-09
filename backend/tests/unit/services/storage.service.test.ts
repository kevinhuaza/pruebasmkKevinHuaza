describe('storage.service (fachada de drivers)', () => {
  const localEnsureReady = jest.fn();
  const s3EnsureReady = jest.fn();

  function mockDrivers() {
    jest.doMock('../../../src/services/storage/local.storage', () => ({
      localStorageDriver: {
        ensureReady: localEnsureReady,
        uploadObject: jest.fn(),
        getObjectStream: jest.fn(),
        deleteObject: jest.fn(),
        objectExists: jest.fn(),
      },
    }));
    jest.doMock('../../../src/services/storage/s3.storage', () => ({
      s3StorageDriver: {
        ensureReady: s3EnsureReady,
        uploadObject: jest.fn(),
        getObjectStream: jest.fn(),
        deleteObject: jest.fn(),
        objectExists: jest.fn(),
      },
    }));
  }

  beforeEach(() => {
    jest.resetModules();
    localEnsureReady.mockReset();
    s3EnsureReady.mockReset();
  });

  it('usa el driver local cuando STORAGE_DRIVER no es "s3" (valor por defecto)', async () => {
    jest.doMock('../../../src/config/env', () => ({
      __esModule: true,
      default: { storage: { driver: 'local', localDir: 'uploads' } },
    }));
    mockDrivers();

    // eslint-disable-next-line @typescript-eslint/no-var-requires
    const storageService = require('../../../src/services/storage.service');
    await storageService.ensureBucketExists();

    expect(localEnsureReady).toHaveBeenCalledTimes(1);
    expect(s3EnsureReady).not.toHaveBeenCalled();
  });

  it('usa el driver de S3 cuando STORAGE_DRIVER=s3', async () => {
    jest.doMock('../../../src/config/env', () => ({
      __esModule: true,
      default: { storage: { driver: 's3', localDir: 'uploads' } },
    }));
    mockDrivers();

    // eslint-disable-next-line @typescript-eslint/no-var-requires
    const storageService = require('../../../src/services/storage.service');
    await storageService.ensureBucketExists();

    expect(s3EnsureReady).toHaveBeenCalledTimes(1);
    expect(localEnsureReady).not.toHaveBeenCalled();
  });
});
