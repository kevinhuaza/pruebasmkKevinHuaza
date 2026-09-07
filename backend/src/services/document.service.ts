import { v4 as uuidv4 } from 'uuid';
import { sequelize, Document, Record, User } from '../models';
import { parseAndValidateCsv } from './csv.service';
import * as storageService from './storage.service';
import ApiError from '../utils/ApiError';

export interface UploadDocumentInput {
  file: Express.Multer.File;
  userId: number;
}

export async function uploadDocument({ file, userId }: UploadDocumentInput): Promise<Document> {
  // Se valida en memoria antes de tocar S3: si el CSV es invalido no se sube nada.
  const validRows = parseAndValidateCsv(file.buffer);

  const objectKey = `documents/${uuidv4()}.csv`;
  await storageService.uploadObject(objectKey, file.buffer, 'text/csv');

  try {
    const document = await sequelize.transaction(async (t) => {
      const doc = await Document.create(
        {
          nombreOriginal: file.originalname,
          nombreAlmacenado: objectKey.split('/').pop() as string,
          rutaArchivo: objectKey,
          numRegistros: validRows.length,
          usuarioId: userId,
        },
        { transaction: t }
      );

      const recordsToInsert = validRows.map((row) => ({ ...row, documentId: doc.id }));
      await Record.bulkCreate(recordsToInsert, { transaction: t });

      return doc;
    });

    return getDocumentById(document.id);
  } catch (error) {
    // Compensacion: si la transaccion de BD falla despues de subir a S3,
    // no dejamos el objeto huerfano en el bucket.
    await storageService.deleteObject(objectKey).catch(() => undefined);
    throw error;
  }
}

export async function listDocuments(): Promise<Document[]> {
  return Document.findAll({
    include: [{ model: User, as: 'usuario', attributes: ['id', 'nombre'] }],
    order: [['fecha_carga', 'DESC']],
  });
}

export async function getDocumentById(id: number | string): Promise<Document> {
  const document = await Document.findByPk(id, {
    include: [{ model: User, as: 'usuario', attributes: ['id', 'nombre'] }],
  });
  if (!document) {
    throw ApiError.notFound('Documento no encontrado');
  }
  return document;
}

export async function deleteDocument(id: number | string): Promise<void> {
  const document = await Document.findByPk(id);
  if (!document) {
    throw ApiError.notFound('Documento no encontrado');
  }

  await document.destroy();
  await storageService.deleteObject(document.rutaArchivo).catch((error) => {
    console.error(`No se pudo eliminar el objeto S3 ${document.rutaArchivo}:`, error);
  });
}
