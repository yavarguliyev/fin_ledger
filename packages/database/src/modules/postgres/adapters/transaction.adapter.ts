import { PoolClient } from 'pg';

import { CommonAdapter } from './common.adapter';
import { DatabaseAdapter } from '../../interfaces/database-adapter.interface';
import { QueryResult } from '../../interfaces/query-result.interface';
import { DatabaseHelper } from '../helpers/database.helper';
import { TransactionWithRetryDto } from '../../dtos/service/transaction-with-retry.dto';
import { QueryDto } from '../../dtos/adapter/query.dto';
import { TransactionClientDto } from '../../dtos/adapter/transaction-client.dto';
import { TransactionDto } from '../../dtos/adapter/transaction.dto';

export class TransactionAdapter extends CommonAdapter implements DatabaseAdapter {
  private readonly client: PoolClient;

  constructor ({ client }: TransactionClientDto) {
    super();
    this.client = client;
  }

  async connect (): Promise<void> {}
  async disconnect (): Promise<void> {}

  async transaction<R> ({ callback }: TransactionDto<R>): Promise<R> {
    return callback(this);
  }

  async transactionWithRetry<R> ({ callback }: TransactionWithRetryDto<R>): Promise<R> {
    return callback(this);
  }

  async query<T = unknown> ({ sql, params = [] }: QueryDto): Promise<QueryResult<T>> {
    try {
      const result = await this.client.query(sql, params);
      return { rows: this.validateQueryResult<T>({ rows: result.rows }), rowCount: result.rowCount || 0 };
    } catch (error) {
      throw DatabaseHelper.translateDatabaseError({ error });
    }
  }
}
