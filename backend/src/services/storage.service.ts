import {
  S3Client,
  PutObjectCommand,
  GetObjectCommand,
  DeleteObjectCommand,
  HeadBucketCommand,
  CreateBucketCommand,
  HeadObjectCommand,
} from '@aws-sdk/client-s3';
import type { Readable } from 'node:stream';
import env from '../config/env';
import ApiError from '../utils/ApiError';

const s3 = new S3Client({
  region: env.aws.region,
  ...(env.aws.endpoint ? { endpoint: env.aws.endpoint, forcePathStyle: env.aws.forcePathStyle } : {}),
  ...(env.aws.accessKeyId && env.aws.secretAccessKey
    ? {
        credentials: {
          accessKeyId: env.aws.accessKeyId,
          secretAccessKey: env.aws.secretAccessKey,
        },
      }
    : {}),
});

/**
 * Crea el bucket si no existe todavia. Pensado para arrancar sin pasos manuales
 * contra LocalStack en desarrollo; en AWS real basta con que el bucket ya exista
 * y el IAM role tenga permiso de HeadBucket (CreateBucket es opcional ahi).
 */
export async function ensureBucketExists(): Promise<void> {
  try {
    await s3.send(new HeadBucketCommand({ Bucket: env.aws.bucket }));
  } catch (error) {
    try {
      await s3.send(new CreateBucketCommand({ Bucket: env.aws.bucket }));
      console.log(`Bucket S3 "${env.aws.bucket}" creado.`);
    } catch (createError) {
      console.warn(
        `No se pudo verificar/crear el bucket S3 "${env.aws.bucket}". Continua asumiendo que ya existe.`,
        createError instanceof Error ? createError.message : createError
      );
    }
  }
}

export async function uploadObject(key: string, body: Buffer, contentType: string): Promise<void> {
  await s3.send(
    new PutObjectCommand({
      Bucket: env.aws.bucket,
      Key: key,
      Body: body,
      ContentType: contentType,
    })
  );
}

export async function getObjectStream(key: string): Promise<Readable> {
  try {
    const result = await s3.send(new GetObjectCommand({ Bucket: env.aws.bucket, Key: key }));
    return result.Body as Readable;
  } catch (error) {
    const code = (error as { name?: string }).name;
    if (code === 'NoSuchKey' || code === 'NotFound') {
      throw ApiError.notFound('El archivo ya no esta disponible en el almacenamiento');
    }
    throw error;
  }
}

export async function deleteObject(key: string): Promise<void> {
  await s3.send(new DeleteObjectCommand({ Bucket: env.aws.bucket, Key: key }));
}

export async function objectExists(key: string): Promise<boolean> {
  try {
    await s3.send(new HeadObjectCommand({ Bucket: env.aws.bucket, Key: key }));
    return true;
  } catch {
    return false;
  }
}
