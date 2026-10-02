import { CryptoHelper } from '@common/shared-libs';

import { INTEGRATION_STACK as S } from '../constants/integration-stack.constant';
import { TEST_ENV_KEYS } from '../constants/test-env-keys.constant';
import { TEST_ORIGINS } from '../constants/test-origins.constant';
import { StackEnv } from '../interfaces/stack-env.interface';

export class StackEnvHelper {
  static forApi ({ containers, database, kafkaPort, apiPort, redisPassword, emailLinkKey }: StackEnv): NodeJS.ProcessEnv {
    const { postgres, redis, rabbitmq, minio } = containers;
    const { publicKey, privateKey } = CryptoHelper.generateRsaKeyPair();
    const storageEndpoint = `http://${minio.getHost()}:${minio.getMappedPort(S.MINIO_PORT)}`;

    return {
      ...S.STATIC_ENV,
      PATH: process.env['PATH'],
      PORT: String(apiPort),
      HOST: S.LOOPBACK,
      FRONTEND_URL: TEST_ORIGINS.FRONTEND,
      ALLOWED_ORIGINS: TEST_ORIGINS.FRONTEND,
      JWT_PRIVATE_KEY: privateKey,
      JWT_PUBLIC_KEY: publicKey,
      JWT_ISSUER: S.JWT_ISSUER,
      JWT_AUDIENCE: S.JWT_ISSUER,
      DB_HOST: postgres.getHost(),
      DB_PORT: String(postgres.getPort()),
      DB_USERNAME: S.APP_DB_USERNAME,
      DB_PASSWORD: database.appDbPassword,
      DB_WORKER_USERNAME: S.APP_WORKER_USERNAME,
      DB_WORKER_PASSWORD: database.appDbPassword,
      DB_NAME: postgres.getDatabase(),
      DB_DATABASE: postgres.getDatabase(),
      REDIS_HOST: redis.getHost(),
      REDIS_PORT: String(redis.getPort()),
      REDIS_PASSWORD: redisPassword,
      RABBITMQ_URL: rabbitmq.getAmqpUrl(),
      RABBITMQ_DEFAULT_HOST: rabbitmq.getHost(),
      KAFKA_BROKERS: `${S.LOOPBACK}:${kafkaPort}`,
      KAFKA_BROKER_HOST: S.LOOPBACK,
      KAFKA_BROKER_PORT: String(kafkaPort),
      STORAGE_ENDPOINT: storageEndpoint,
      STORAGE_PUBLIC_ENDPOINT: storageEndpoint,
      STORAGE_ACCESS_KEY: S.MINIO_USER,
      STORAGE_SECRET_KEY: S.MINIO_PASSWORD,
      MFA_ENCRYPTION_KEY: CryptoHelper.randomBytes({ bytes: S.KEY_BYTES }).toString(S.KEY_ENCODING),
      EMAIL_LINK_ENCRYPTION_KEY: emailLinkKey,
      PASSKEY_RP_ID: TEST_ORIGINS.RP_ID,
      PASSKEY_ORIGIN: TEST_ORIGINS.FRONTEND
    };
  }

  static exportForTests ({ containers, database, kafkaPort, apiPort, redisPassword, emailLinkKey }: StackEnv): void {
    const { redis, rabbitmq } = containers;

    process.env[TEST_ENV_KEYS.API_URL] = `http://${S.LOOPBACK}:${apiPort}${S.API_PREFIX}`;
    process.env[TEST_ENV_KEYS.DATABASE_URL] = database.databaseUrl;
    process.env[TEST_ENV_KEYS.APP_DATABASE_URL] = database.appDatabaseUrl;
    process.env[TEST_ENV_KEYS.KAFKA_BROKERS] = `${S.LOOPBACK}:${kafkaPort}`;
    process.env[TEST_ENV_KEYS.RABBITMQ_URL] = rabbitmq.getAmqpUrl();
    process.env[TEST_ENV_KEYS.RABBITMQ_MANAGEMENT_URL] = `http://${rabbitmq.getHost()}:${rabbitmq.getMappedPort(S.RABBITMQ_HTTP_PORT)}`;
    process.env[TEST_ENV_KEYS.EMAIL_LINK_KEY] = emailLinkKey;
    process.env[TEST_ENV_KEYS.REDIS_URL] = `redis://:${redisPassword}@${redis.getHost()}:${redis.getPort()}/0`;
  }
}
