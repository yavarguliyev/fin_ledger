import { Pool, QueryResultRow } from 'pg';

import { TEST_ENV_KEYS } from '../constants/test-env-keys.constant';
import { DbQuery } from '../interfaces/db-query.interface';

export class DbHelper {
  private static pool: Pool | null = null;

  static async query<T extends QueryResultRow = QueryResultRow>({ sql, params = [] }: DbQuery): Promise<T[]> {
    DbHelper.pool ??= new Pool({ connectionString: process.env[TEST_ENV_KEYS.DATABASE_URL] });
    const result = await DbHelper.pool.query<T>(sql, params);
    return result.rows;
  }

  static async close(): Promise<void> {
    await DbHelper.pool?.end();
    DbHelper.pool = null;
  }
}
