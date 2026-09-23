import { PoolConfig } from 'pg';

import { POOL_CONSTANTS } from '../../constants/pool/pool.constant';
import { DatabaseConfig } from '../../interfaces/database-config.interface';

export class PoolHelper {
  static buildConfig ({ config }: { config: DatabaseConfig }): PoolConfig {
    const statementTimeout = config.statementTimeoutMillis ?? POOL_CONSTANTS.DEFAULT_STATEMENT_TIMEOUT_MS;
    const idleInTransactionTimeout = config.idleInTransactionTimeoutMillis ?? POOL_CONSTANTS.DEFAULT_IDLE_IN_TRANSACTION_TIMEOUT_MS;

    return {
      host: config.host,
      port: config.port,
      user: config.username,
      password: config.password,
      database: config.database,
      ssl: config.ssl,
      max: config.connectionLimit || POOL_CONSTANTS.DEFAULT_MAX,
      min: config.minLimit ?? POOL_CONSTANTS.DEFAULT_MIN,
      idleTimeoutMillis: config.idleTimeoutMillis ?? POOL_CONSTANTS.DEFAULT_IDLE_TIMEOUT_MS,
      connectionTimeoutMillis: config.connectionTimeoutMillis ?? POOL_CONSTANTS.DEFAULT_CONNECTION_TIMEOUT_MS,
      maxLifetimeSeconds: config.maxLifetimeSeconds ?? POOL_CONSTANTS.DEFAULT_MAX_LIFETIME_SECONDS,
      keepAlive: true,
      application_name: config.applicationName ?? config.clientId,
      options: `-c statement_timeout=${statementTimeout} -c idle_in_transaction_session_timeout=${idleInTransactionTimeout}`
    };
  }
}
