import multer, { FileFilterCallback } from 'multer';
import path from 'node:path';
import { Request } from 'express';
import env from '../config/env';
import ApiError from '../utils/ApiError';

function fileFilter(req: Request, file: Express.Multer.File, cb: FileFilterCallback): void {
  const isCsvMime = ['text/csv', 'application/vnd.ms-excel', 'application/csv', 'text/plain'].includes(
    file.mimetype
  );
  const isCsvExt = path.extname(file.originalname).toLowerCase() === '.csv';

  if (!isCsvExt) {
    cb(ApiError.badRequest('Solo se permiten archivos con extension .csv'));
    return;
  }
  cb(null, isCsvMime || isCsvExt);
}

// Los archivos se reciben en memoria (Buffer) y se suben directo a S3,
// sin pasar por disco local.
export const upload = multer({
  storage: multer.memoryStorage(),
  fileFilter,
  limits: { fileSize: env.upload.maxFileSizeMb * 1024 * 1024 },
});
