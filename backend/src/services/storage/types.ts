import type { Readable } from 'node:stream';
export interface StorageDriver {
  ensureReady(): Promise<void>;
  uploadObject(key: string, body: Buffer, contentType: string): Promise<void>;
  getObjectStream(key: string): Promise<Readable>;
  deleteObject(key: string): Promise<void>;
  objectExists(key: string): Promise<boolean>;
}
