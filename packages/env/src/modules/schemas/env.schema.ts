import { z } from 'zod';
import { Environment } from '@common/shared-libs';

export const EnvironmentVariablesSchema = z.object({
  NODE_ENV: z.enum(Environment, { message: 'NODE_ENV must be a valid Environment enum' }),

  PORT: z.coerce
    .number({ message: 'PORT must be a number' })
    .int({ message: 'PORT must be an integer' })
    .min(0, { message: 'PORT must be at least 0' })
    .max(65535, { message: 'PORT must not exceed 65535' }),

  FRONTEND_URL: z.coerce.string({ message: 'FRONTEND_URL must be a string' }).min(1, { message: 'FRONTEND_URL is required' }),
  EMAIL_FROM: z.string({ message: 'EMAIL_FROM must be a string' }).min(1, { message: 'EMAIL_FROM is required' }),
  HOST: z.string({ message: 'HOST must be a string' }).default('0.0.0.0'),

  JWT_PRIVATE_KEY: z.string({ message: 'JWT_PRIVATE_KEY must be a string' }).min(1, { message: 'JWT_PRIVATE_KEY is required' }),
  JWT_PUBLIC_KEY: z.string({ message: 'JWT_PUBLIC_KEY must be a string' }).min(1, { message: 'JWT_PUBLIC_KEY is required' }),
  JWT_EXPIRES_IN: z.string({ message: 'JWT_EXPIRES_IN must be a string' }).min(1, { message: 'JWT_EXPIRES_IN is required' }),
  JWT_ISSUER: z.string({ message: 'JWT_ISSUER must be a string' }).min(1, { message: 'JWT_ISSUER is required' }),
  JWT_AUDIENCE: z.string({ message: 'JWT_AUDIENCE must be a string' }).min(1, { message: 'JWT_AUDIENCE is required' }),

  DB_USERNAME: z.string({ message: 'DB_USERNAME must be a string' }).min(1, { message: 'DB_USERNAME is required' }),
  DB_PASSWORD: z.string({ message: 'DB_PASSWORD must be a string' }).min(1, { message: 'DB_PASSWORD is required' }),
  DB_NAME: z.string({ message: 'DB_NAME must be a string' }).min(1, { message: 'DB_NAME is required' }),
  DB_HOST: z.string({ message: 'DB_HOST must be a string' }).min(1, { message: 'DB_HOST is required' }),
  DB_PORT: z.coerce.number({ message: 'DB_PORT must be a number' }),

  REDIS_HOST: z.string({ message: 'REDIS_HOST must be a string' }).min(1, { message: 'REDIS_HOST is required' }),
  REDIS_PORT: z.coerce.number({ message: 'REDIS_PORT must be a number' }),
  REDIS_PASSWORD: z.string({ message: 'REDIS_PASSWORD must be a string' }).min(1, { message: 'REDIS_PASSWORD is required' }),

  RABBITMQ_DEFAULT_USER: z.string({ message: 'RABBITMQ_DEFAULT_USER must be a string' }).min(1, { message: 'RABBITMQ_DEFAULT_USER is required' }),
  RABBITMQ_DEFAULT_PASS: z.string({ message: 'RABBITMQ_DEFAULT_PASS must be a string' }).min(1, { message: 'RABBITMQ_DEFAULT_PASS is required' }),
  RABBITMQ_DEFAULT_HOST: z.string({ message: 'RABBITMQ_DEFAULT_HOST must be a string' }).min(1, { message: 'RABBITMQ_DEFAULT_HOST is required' }),

  JWT_SECRET: z.string({ message: 'JWT_SECRET must be a string' }).optional(),

  STORAGE_STRATEGY: z.string({ message: 'STORAGE_STRATEGY must be a string' }).min(1, { message: 'STORAGE_STRATEGY is required' }),
  STORAGE_ENDPOINT: z.string({ message: 'STORAGE_ENDPOINT must be a string' }).optional(),
  STORAGE_PUBLIC_ENDPOINT: z.string({ message: 'STORAGE_PUBLIC_ENDPOINT must be a string' }).optional(),

  STORAGE_ACCESS_KEY: z.string({ message: 'STORAGE_ACCESS_KEY must be a string' }).min(1, { message: 'STORAGE_ACCESS_KEY is required' }),
  STORAGE_SECRET_KEY: z.string({ message: 'STORAGE_SECRET_KEY must be a string' }).min(1, { message: 'STORAGE_SECRET_KEY is required' }),
  STORAGE_BUCKET_NAME: z.string({ message: 'STORAGE_BUCKET_NAME must be a string' }).min(1, { message: 'STORAGE_BUCKET_NAME is required' }),
  STORAGE_REGION: z.string({ message: 'STORAGE_REGION must be a string' }).min(1, { message: 'STORAGE_REGION is required' }),

  STORAGE_FORCE_PATH_STYLE: z.coerce.boolean({ message: 'STORAGE_FORCE_PATH_STYLE must be a boolean' }),
  STORAGE_ENSURE_BUCKET: z.coerce.boolean({ message: 'STORAGE_ENSURE_BUCKET must be a boolean' }),

  REDIS_DB: z.coerce.number({ message: 'REDIS_DB must be a number' }).optional(),
  REDIS_CLUSTER_NODES: z.string({ message: 'REDIS_CLUSTER_NODES must be a string' }).optional(),
  REDIS_SENTINEL_HOST: z.string({ message: 'REDIS_SENTINEL_HOST must be a string' }).optional(),
  REDIS_SENTINEL_PORT: z.coerce.number({ message: 'REDIS_SENTINEL_PORT must be a number' }).optional(),
  REDIS_MASTER_NAME: z.string({ message: 'REDIS_MASTER_NAME must be a string' }).optional(),

  RABBITMQ_URL: z.string({ message: 'RABBITMQ_URL must be a string' }).optional(),
  KAFKA_HOST: z.string({ message: 'KAFKA_HOST must be a string' }).default('localhost:9092'),
  KAFKA_BROKERS: z.string({ message: 'KAFKA_BROKERS must be a string' }).default('localhost:9092'),
  FX_RATE_API_URL: z.string({ message: 'FX_RATE_API_URL must be a string' }).optional()
});

export type EnvironmentVariables = z.infer<typeof EnvironmentVariablesSchema>;
