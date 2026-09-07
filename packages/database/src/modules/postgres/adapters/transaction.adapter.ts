import { PoolClient } from 'pg';

import { CommonAdapter } from './common.adapter';
import { DatabaseAdapter, QueryResult } from '../../interfaces/database.interface';

export class TransactionAdapter extends CommonAdapter implements DatabaseAdapter {
  constructor (private client: PoolClient) {
    super();
  }

  isConnected = (): boolean => true;

  async connect (): Promise<void> {}
  async disconnect (): Promise<void> {}

  async transaction<R> (callback: (adapter: DatabaseAdapter) => Promise<R>): Promise<R> {
    return callback(this);
  }

  async transactionWithRetry<R> (callback: (adapter: DatabaseAdapter) => Promise<R>): Promise<R> {
    return callback(this);
  }

  async query<T = unknown> (sql: string, params: unknown[] = []): Promise<QueryResult<T>> {
    const result = await this.client.query(sql, params);
    return { rows: this.validateQueryResult<T>(result.rows), rowCount: result.rowCount || 0 };
  }
}
