import fs from 'node:fs';
import path from 'node:path';
import env from '../../config/env';
import ApiError from '../../utils/ApiError';
import type { StorageDriver } from './types';

const ROOT_DIR = path.join(process.cwd(), env.storage.localDir);
function resolvePath(key: string): string {
  return path.join(ROOT_DIR, key);
}

async function ensureReady(): Promise<void> {
  await fs.promises.mkdir(ROOT_DIR, { recursive: true });
}

async function uploadObject(key: string, body: Buffer, _contentType: string): Promise<void> {
  const filePath = resolvePath(key);
  await fs.promises.mkdir(path.dirname(filePath), { recursive: true });
  await fs.promises.writeFile(filePath, body);
}

async function getObjectStream(key: string) {
  const filePath = resolvePath(key);
  try {
    await fs.promises.access(filePath, fs.constants.R_OK);
  } catch {
    throw ApiError.notFound('El archivo ya no esta disponible en el almacenamiento');
  }
  return fs.createReadStream(filePath);
}

async function deleteObject(key: string): Promise<void> {
  await fs.promises.rm(resolvePath(key), { force: true });
}

async function objectExists(key: string): Promise<boolean> {
  try {
    await fs.promises.access(resolvePath(key), fs.constants.R_OK);
    return true;
  } catch {
    return false;
  }
}

export const localStorageDriver: StorageDriver = {
  ensureReady,
  uploadObject,
  getObjectStream,
  deleteObject,
  objectExists,
};
