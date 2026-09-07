jest.mock('../../../src/services/storage.service');

import * as storageService from '../../../src/services/storage.service';
import * as templateService from '../../../src/services/template.service';

const mockedStorage = storageService as jest.Mocked<typeof storageService>;

describe('template.service', () => {
  describe('ensureTemplateExists', () => {
    it('no sube nada si la plantilla ya existe en S3', async () => {
      mockedStorage.objectExists.mockResolvedValue(true);

      await templateService.ensureTemplateExists();

      expect(mockedStorage.uploadObject).not.toHaveBeenCalled();
    });

    it('sube la plantilla si todavia no existe en S3', async () => {
      mockedStorage.objectExists.mockResolvedValue(false);
      mockedStorage.uploadObject.mockResolvedValue(undefined);

      await templateService.ensureTemplateExists();

      expect(mockedStorage.uploadObject).toHaveBeenCalledWith(
        templateService.TEMPLATE_KEY,
        expect.any(Buffer),
        'text/csv'
      );
      const buffer = mockedStorage.uploadObject.mock.calls[0][1] as Buffer;
      expect(buffer.toString('utf-8')).toContain('correo,nombre,telefono,ciudad,notas');
    });
  });

  describe('getTemplateStream', () => {
    it('delega en storageService.getObjectStream con la key de la plantilla', async () => {
      const fakeStream = {} as never;
      mockedStorage.getObjectStream.mockResolvedValue(fakeStream);

      const result = await templateService.getTemplateStream();

      expect(mockedStorage.getObjectStream).toHaveBeenCalledWith(templateService.TEMPLATE_KEY);
      expect(result).toBe(fakeStream);
    });
  });
});
