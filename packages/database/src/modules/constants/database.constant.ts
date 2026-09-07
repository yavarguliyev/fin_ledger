import { DatabaseType } from '@common/shared-libs';

import { DatabaseAdapter } from '../interfaces/database.interface';
import { PostgreSQLAdapter } from '../postgres/adapters/postgresql.adapter';
import { DatabaseConfig } from '../interfaces/database.interface';

export const DATABASE_ADAPTER_MAP: Record<DatabaseType, new (config: DatabaseConfig) => DatabaseAdapter> = {
  [DatabaseType.POSTGRESQL]: PostgreSQLAdapter
};
