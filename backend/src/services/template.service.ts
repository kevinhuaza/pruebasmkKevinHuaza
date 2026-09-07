import type { Readable } from 'node:stream';
import * as storageService from './storage.service';

export const TEMPLATE_KEY = 'templates/plantilla-clientes.csv';
export const TEMPLATE_FILENAME = 'plantilla-clientes.csv';

const TEMPLATE_CONTENT =
  'correo,nombre,telefono,ciudad,notas\n' +
  'juan.perez@example.com,Juan Perez,+34612345678,Madrid,Cliente frecuente\n' +
  'maria.gomez@example.com,Maria Gomez,3001234567,Bogota,\n';

/**
 * Sube la plantilla de ejemplo a S3 si todavia no existe. Se corre al arrancar
 * el servidor, asi el frontend siempre tiene un archivo real que ofrecer para
 * descargar (no un asset estatico embebido en el bundle).
 */
export async function ensureTemplateExists(): Promise<void> {
  const exists = await storageService.objectExists(TEMPLATE_KEY);
  if (!exists) {
    await storageService.uploadObject(TEMPLATE_KEY, Buffer.from(TEMPLATE_CONTENT, 'utf-8'), 'text/csv');
    console.log(`Plantilla CSV subida a S3 (${TEMPLATE_KEY}).`);
  }
}

export function getTemplateStream(): Promise<Readable> {
  return storageService.getObjectStream(TEMPLATE_KEY);
}
