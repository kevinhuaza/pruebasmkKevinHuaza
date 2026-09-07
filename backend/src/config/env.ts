import dotenv from 'dotenv';

dotenv.config();

function required(name: string, fallback?: string): string {
  const value = process.env[name] ?? fallback;
  if (value === undefined) {
    throw new Error(`Missing required environment variable: ${name}`);
  }
  return value;
}

export interface EnvConfig {
  nodeEnv: string;
  port: number;
  db: {
    host: string;
    port: number;
    name: string;
    user: string;
    password: string;
  };
  jwt: {
    secret: string;
    expiresIn: string;
  };
  cors: {
    origin: string;
  };
  upload: {
    maxFileSizeMb: number;
  };
  aws: {
    region: string;
    accessKeyId?: string;
    secretAccessKey?: string;
    bucket: string;
    endpoint?: string;
    forcePathStyle: boolean;
  };
}

const env: EnvConfig = {
  nodeEnv: process.env.NODE_ENV || 'development',
  port: Number(process.env.PORT) || 4000,

  db: {
    host: required('DB_HOST', 'localhost'),
    port: Number(process.env.DB_PORT) || 5432,
    name: required('DB_NAME', 'csv_manager'),
    user: required('DB_USER', 'csv_user'),
    password: required('DB_PASSWORD', 'csv_password'),
  },

  jwt: {
    secret: required('JWT_SECRET'),
    expiresIn: process.env.JWT_EXPIRES_IN || '8h',
  },

  cors: {
    origin: process.env.CORS_ORIGIN || 'http://localhost:5173',
  },

  upload: {
    maxFileSizeMb: Number(process.env.MAX_FILE_SIZE_MB) || 5,
  },

  aws: {
    region: process.env.AWS_REGION || 'us-east-1',
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
    bucket: required('S3_BUCKET_NAME', 'csv-manager-documents'),
    // S3_ENDPOINT: dejar vacio para AWS real; se usa para apuntar a LocalStack en local/Docker.
    endpoint: process.env.S3_ENDPOINT || undefined,
    forcePathStyle: (process.env.S3_FORCE_PATH_STYLE || 'false') === 'true',
  },
};

export default env;
