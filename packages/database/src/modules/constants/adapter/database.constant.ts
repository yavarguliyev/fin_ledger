import { DatabaseType } from '@common/shared-libs';

import { DatabaseAdapter } from '../../interfaces/database-adapter.interface';
import { PostgreSQLAdapter } from '../../postgres/adapters/postgresql.adapter';
import { AdapterConfigDto } from '../../dtos/adapter/adapter-config.dto';

export const DATABASE_ADAPTER_MAP: Record<DatabaseType, new (dto: AdapterConfigDto) => DatabaseAdapter> = {
  [DatabaseType.POSTGRESQL]: PostgreSQLAdapter
};
