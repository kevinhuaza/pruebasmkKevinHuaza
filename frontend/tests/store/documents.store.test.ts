import { describe, it, expect, beforeEach, vi } from 'vitest';
import { setActivePinia, createPinia } from 'pinia';

vi.mock('../../src/api/axios', () => ({
  default: { get: vi.fn(), post: vi.fn(), delete: vi.fn() },
}));

import apiClient from '../../src/api/axios';
import { useDocumentsStore } from '../../src/store/documents';
import type { CsvDocument } from '../../src/types';

const mockedGet = apiClient.get as unknown as ReturnType<typeof vi.fn>;
const mockedPost = apiClient.post as unknown as ReturnType<typeof vi.fn>;
const mockedDelete = apiClient.delete as unknown as ReturnType<typeof vi.fn>;

const sampleDoc: CsvDocument = {
  id: 1,
  nombreOriginal: 'clientes.csv',
  nombreAlmacenado: 'uuid.csv',
  rutaArchivo: 'documents/uuid.csv',
  numRegistros: 2,
  usuarioId: 1,
  fecha_carga: '2026-01-01T00:00:00.000Z',
};

describe('store/documents', () => {
  beforeEach(() => {
    setActivePinia(createPinia());
    vi.clearAllMocks();
    if (!('createObjectURL' in window.URL)) {
      (window.URL as unknown as { createObjectURL: () => string }).createObjectURL = () => 'blob:mock';
    }
    if (!('revokeObjectURL' in window.URL)) {
      (window.URL as unknown as { revokeObjectURL: () => void }).revokeObjectURL = () => undefined;
    }
    vi.spyOn(window.URL, 'createObjectURL').mockReturnValue('blob:mock');
    vi.spyOn(window.URL, 'revokeObjectURL').mockImplementation(() => undefined);
  });

  it('fetchDocuments carga la lista en el estado', async () => {
    mockedGet.mockResolvedValue({ data: { data: [sampleDoc] } });

    const store = useDocumentsStore();
    await store.fetchDocuments();

    expect(store.documents).toEqual([sampleDoc]);
    expect(store.loading).toBe(false);
  });

  it('uploadDocument agrega el documento nuevo al inicio de la lista', async () => {
    mockedPost.mockResolvedValue({ data: { data: sampleDoc } });

    const store = useDocumentsStore();
    const file = new File(['contenido'], 'clientes.csv', { type: 'text/csv' });
    const result = await store.uploadDocument(file);

    expect(mockedPost).toHaveBeenCalledWith(
      '/documents/upload',
      expect.any(FormData),
      expect.objectContaining({ headers: { 'Content-Type': 'multipart/form-data' } })
    );
    expect(result).toEqual(sampleDoc);
    expect(store.documents[0]).toEqual(sampleDoc);
  });

  it('downloadTemplate pide el CSV de plantilla como blob', async () => {
    mockedGet.mockResolvedValue({ data: new Blob(['correo,nombre\n']) });

    const store = useDocumentsStore();
    await store.downloadTemplate();

    expect(mockedGet).toHaveBeenCalledWith('/documents/template', { responseType: 'blob' });
  });

  it('downloadDocument pide el archivo del documento como blob', async () => {
    mockedGet.mockResolvedValue({ data: new Blob(['correo,nombre\n']) });

    const store = useDocumentsStore();
    await store.downloadDocument(sampleDoc);

    expect(mockedGet).toHaveBeenCalledWith('/documents/1/download', { responseType: 'blob' });
  });

  it('deleteDocument quita el documento del estado', async () => {
    mockedDelete.mockResolvedValue({});

    const store = useDocumentsStore();
    store.documents = [sampleDoc];
    await store.deleteDocument(1);

    expect(mockedDelete).toHaveBeenCalledWith('/documents/1');
    expect(store.documents).toHaveLength(0);
  });
});
