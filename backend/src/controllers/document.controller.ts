import { Request, Response } from 'express';
import catchAsync from '../utils/catchAsync';
import ApiError from '../utils/ApiError';
import * as documentService from '../services/document.service';
import * as storageService from '../services/storage.service';
import * as templateService from '../services/template.service';

export const upload = catchAsync(async (req: Request, res: Response) => {
  if (!req.file) {
    throw ApiError.badRequest('Debes adjuntar un archivo CSV en el campo "file"');
  }
  if (!req.user) {
    throw ApiError.unauthorized();
  }

  const document = await documentService.uploadDocument({
    file: req.file,
    userId: req.user.id,
  });

  res.status(201).json({ success: true, data: document });
});

export const list = catchAsync(async (req: Request, res: Response) => {
  const documents = await documentService.listDocuments();
  res.status(200).json({ success: true, data: documents });
});

export const download = catchAsync(async (req: Request, res: Response) => {
  const document = await documentService.getDocumentById(req.params.id);
  const stream = await storageService.getObjectStream(document.storageKey);

  res.setHeader('Content-Type', 'text/csv');
  res.setHeader('Content-Disposition', `attachment; filename="${document.originalName}"`);

  stream.on('error', () => {
    res.destroy();
  });
  stream.pipe(res);
});

export const downloadTemplate = catchAsync(async (req: Request, res: Response) => {
  const stream = await templateService.getTemplateStream();

  res.setHeader('Content-Type', 'text/csv');
  res.setHeader('Content-Disposition', `attachment; filename="${templateService.TEMPLATE_FILENAME}"`);

  stream.on('error', () => {
    res.destroy();
  });
  stream.pipe(res);
});

export const remove = catchAsync(async (req: Request, res: Response) => {
  await documentService.deleteDocument(req.params.id);
  res.status(200).json({ success: true, message: 'Documento eliminado correctamente' });
});
