import { DatabaseConfig } from '@common/database';
import { DatabaseType } from '@common/shared-libs';

import { DATABASE_DEFAULTS } from '../constants/database/database-defaults.constant';
import { DATABASE_ENV_KEYS } from '../constants/database/database-env-keys.constant';
import { EnvConfigSourceDto } from '../dtos/config/env-config-source.dto';
import { WorkerCredentials } from '../interfaces/worker-credentials.interface';

export class DatabaseConfigHelper {
  static fromEnv ({ configService, clientId }: EnvConfigSourceDto): DatabaseConfig {
    const read = <T>(key: string, fallback: T): T => configService.get<T>(key) ?? fallback;

    return {
      type: DatabaseType.POSTGRESQL,
      host: read(DATABASE_ENV_KEYS.HOST, DATABASE_DEFAULTS.HOST),
      port: read(DATABASE_ENV_KEYS.PORT, DATABASE_DEFAULTS.PORT),
      username: read(DATABASE_ENV_KEYS.USERNAME, DATABASE_DEFAULTS.EMPTY),
      password: read(DATABASE_ENV_KEYS.PASSWORD, DATABASE_DEFAULTS.EMPTY),
      database: configService.get<string>(DATABASE_ENV_KEYS.NAME) ?? read(DATABASE_ENV_KEYS.DATABASE, DATABASE_DEFAULTS.EMPTY),
      ssl: configService.get<string>(DATABASE_ENV_KEYS.SSL) === DATABASE_DEFAULTS.SSL_ENABLED,
      minLimit: read(DATABASE_ENV_KEYS.MIN_LIMIT, DATABASE_DEFAULTS.POOL_MIN),
      statementTimeoutMillis: read(DATABASE_ENV_KEYS.STATEMENT_TIMEOUT, DATABASE_DEFAULTS.STATEMENT_TIMEOUT_MS),
      idleInTransactionTimeoutMillis: read(DATABASE_ENV_KEYS.IDLE_IN_TRANSACTION_TIMEOUT, DATABASE_DEFAULTS.IDLE_IN_TRANSACTION_TIMEOUT_MS),
      maxLifetimeSeconds: read(DATABASE_ENV_KEYS.MAX_LIFETIME_SECONDS, DATABASE_DEFAULTS.MAX_LIFETIME_SECONDS),
      applicationName: configService.get<string>(DATABASE_ENV_KEYS.APPLICATION_NAME) ?? String(clientId ?? DATABASE_DEFAULTS.APPLICATION_NAME),
      ...DatabaseConfigHelper.workerCredentials({ configService }),

      connectionLimit:
        configService.get<number>(DATABASE_ENV_KEYS.PRIMARY_POOL_MAX) ?? read(DATABASE_ENV_KEYS.CONNECTION_LIMIT, DATABASE_DEFAULTS.POOL_MAX),

      connectionTimeoutMillis:
        configService.get<number>(DATABASE_ENV_KEYS.ACQUIRE_TIMEOUT) ??
        read(DATABASE_ENV_KEYS.CONNECTION_TIMEOUT, DATABASE_DEFAULTS.ACQUIRE_TIMEOUT_MS)
    };
  }

  private static workerCredentials ({ configService }: EnvConfigSourceDto): WorkerCredentials | Record<string, never> {
    const workerUsername = configService.get<string>(DATABASE_ENV_KEYS.WORKER_USERNAME);
    const workerPassword = configService.get<string>(DATABASE_ENV_KEYS.WORKER_PASSWORD);
    return workerUsername && workerPassword ? { workerUsername, workerPassword } : {};
  }
}
