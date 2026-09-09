import { NextFunction, Request, Response } from 'express';

let mockCurrentUser: { id: number; username: string; role: 'user' | 'admin' } | null = null;

jest.mock(
  '../../src/middlewares/auth.middleware',
  () =>
    (req: Request, res: Response, next: NextFunction) => {
      if (!mockCurrentUser) {
        res.status(401).json({ success: false, message: 'Token no proporcionado' });
        return;
      }
      req.user = mockCurrentUser;
      next();
    }
);

jest.mock('../../src/services/document.service');
jest.mock('../../src/services/template.service');

import { Readable } from 'node:stream';
import request from 'supertest';
import * as documentService from '../../src/services/document.service';
import * as templateService from '../../src/services/template.service';
import ApiError from '../../src/utils/ApiError';
import app from '../../src/app';

const mockedDocumentService = documentService as jest.Mocked<typeof documentService>;
const mockedTemplateService = templateService as jest.Mocked<typeof templateService>;

beforeEach(() => {
  mockCurrentUser = null;
});

describe('GET /api/documents', () => {
  it('retorna 401 sin token/usuario autenticado', async () => {
    const res = await request(app).get('/api/documents');
    expect(res.status).toBe(401);
  });

  it('retorna la lista de documentos para un usuario autenticado', async () => {
    mockCurrentUser = { id: 1, username: 'juan', role: 'user' };
    mockedDocumentService.listDocuments.mockResolvedValue([
      { id: 1, originalName: 'a.csv' },
    ] as never);

    const res = await request(app).get('/api/documents');

    expect(res.status).toBe(200);
    expect(res.body.data).toHaveLength(1);
  });
});

describe('GET /api/documents/template', () => {
  it('retorna 401 sin token/usuario autenticado', async () => {
    const res = await request(app).get('/api/documents/template');
    expect(res.status).toBe(401);
  });

  it('transmite el CSV de la plantilla para un usuario autenticado', async () => {
    mockCurrentUser = { id: 1, username: 'juan', role: 'user' };
    mockedTemplateService.getTemplateStream.mockResolvedValue(
      Readable.from(['correo,nombre,telefono,ciudad,notas\n'])
    );

    const res = await request(app).get('/api/documents/template');

    expect(res.status).toBe(200);
    expect(res.headers['content-type']).toContain('text/csv');
    expect(res.headers['content-disposition']).toContain('plantilla-clientes.csv');
    expect(res.text).toContain('correo,nombre,telefono,ciudad,notas');
  });
});

describe('DELETE /api/documents/:id (RBAC)', () => {
  it('retorna 403 cuando el usuario autenticado no es admin', async () => {
    mockCurrentUser = { id: 2, username: 'user_normal', role: 'user' };

    const res = await request(app).delete('/api/documents/1');

    expect(res.status).toBe(403);
    expect(mockedDocumentService.deleteDocument).not.toHaveBeenCalled();
  });

  it('permite eliminar cuando el usuario autenticado es admin', async () => {
    mockCurrentUser = { id: 1, username: 'admin_test', role: 'admin' };
    mockedDocumentService.deleteDocument.mockResolvedValue(undefined);

    const res = await request(app).delete('/api/documents/1');

    expect(res.status).toBe(200);
    expect(mockedDocumentService.deleteDocument).toHaveBeenCalledWith('1');
  });

  it('retorna 404 cuando el documento no existe', async () => {
    mockCurrentUser = { id: 1, username: 'admin_test', role: 'admin' };
    mockedDocumentService.deleteDocument.mockRejectedValue(
      ApiError.notFound('Documento no encontrado')
    );

    const res = await request(app).delete('/api/documents/999');

    expect(res.status).toBe(404);
  });
});
