import env from '../config/env';
import { localStorageDriver } from './storage/local.storage';
import { s3StorageDriver } from './storage/s3.storage';
import type { StorageDriver } from './storage/types';

const driver: StorageDriver = env.storage.driver === 's3' ? s3StorageDriver : localStorageDriver;

export function ensureBucketExists(): Promise<void> {
  return driver.ensureReady();
}

export function uploadObject(key: string, body: Buffer, contentType: string): Promise<void> {
  return driver.uploadObject(key, body, contentType);
}

export function getObjectStream(key: string) {
  return driver.getObjectStream(key);
}

export function deleteObject(key: string): Promise<void> {
  return driver.deleteObject(key);
}

export function objectExists(key: string): Promise<boolean> {
  return driver.objectExists(key);
}
