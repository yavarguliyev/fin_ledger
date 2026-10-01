import { ClientIds, DatabaseType } from '@common/shared-libs';

export interface DatabaseConfig {
  readonly clientId?: ClientIds;

  readonly ssl?: boolean;
  readonly minLimit?: number;
  readonly connectionTimeoutMillis?: number;
  readonly idleTimeoutMillis?: number;
  readonly replicaHosts?: string[];
  readonly statementTimeoutMillis?: number;
  readonly idleInTransactionTimeoutMillis?: number;
  readonly maxLifetimeSeconds?: number;
  readonly applicationName?: string;
  readonly workerUsername?: string;
  readonly workerPassword?: string;

  readonly type: DatabaseType;

  readonly host: string;
  readonly port: number;
  readonly username: string;
  readonly password: string;
  readonly database: string;
  readonly connectionLimit: number;
}
