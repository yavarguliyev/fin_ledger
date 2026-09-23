import { ConfigService } from '@nestjs/config';
import { DatabaseConfig } from '@common/database';
import { ClientIds, DatabaseType } from '@common/shared-libs';

const DEFAULTS = {
  HOST: 'localhost',
  PORT: 5432,
  POOL_MAX: 10,
  POOL_MIN: 2,
  ACQUIRE_TIMEOUT_MS: 5_000,
  STATEMENT_TIMEOUT_MS: 5_000,
  IDLE_IN_TRANSACTION_TIMEOUT_MS: 10_000,
  MAX_LIFETIME_SECONDS: 1_800,
  APPLICATION_NAME: 'core-api'
} as const;

export class DatabaseConfigHelper {
  private static workerCredentials ({ configService }: { configService: ConfigService }): { workerUsername: string; workerPassword: string } | Record<string, never> {
    const workerUsername = configService.get<string>('DB_WORKER_USERNAME');
    const workerPassword = configService.get<string>('DB_WORKER_PASSWORD');

    return workerUsername && workerPassword ? { workerUsername, workerPassword } : {};
  }

  static fromEnv ({ configService, clientId }: { configService: ConfigService; clientId?: ClientIds }): DatabaseConfig {
    const read = <T>(key: string, fallback: T): T => configService.get<T>(key) ?? fallback;

    return {
      type: DatabaseType.POSTGRESQL,
      host: read('DB_HOST', DEFAULTS.HOST),
      port: read('DB_PORT', DEFAULTS.PORT),
      username: read('DB_USERNAME', ''),
      password: read('DB_PASSWORD', ''),
      database: configService.get<string>('DB_NAME') ?? read('DB_DATABASE', ''),
      ssl: configService.get<string>('DB_SSL') === 'true',
      connectionLimit: configService.get<number>('DB_PRIMARY_POOL_MAX') ?? read('DB_CONNECTION_LIMIT', DEFAULTS.POOL_MAX),
      minLimit: read('DB_MIN_LIMIT', DEFAULTS.POOL_MIN),
      connectionTimeoutMillis: configService.get<number>('DB_ACQUIRE_TIMEOUT') ?? read('DB_CONNECTION_TIMEOUT', DEFAULTS.ACQUIRE_TIMEOUT_MS),
      statementTimeoutMillis: read('DB_STATEMENT_TIMEOUT', DEFAULTS.STATEMENT_TIMEOUT_MS),
      idleInTransactionTimeoutMillis: read('DB_IDLE_IN_TRANSACTION_TIMEOUT', DEFAULTS.IDLE_IN_TRANSACTION_TIMEOUT_MS),
      maxLifetimeSeconds: read('DB_MAX_LIFETIME_SECONDS', DEFAULTS.MAX_LIFETIME_SECONDS),
      applicationName: configService.get<string>('DB_APPLICATION_NAME') ?? String(clientId ?? DEFAULTS.APPLICATION_NAME),
      ...DatabaseConfigHelper.workerCredentials({ configService })
    };
  }
}
