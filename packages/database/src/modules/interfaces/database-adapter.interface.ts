import type { QueryDto } from '../dtos/adapter/query.dto';
import type { TransactionDto } from '../dtos/adapter/transaction.dto';
import type { TransactionWithRetryDto } from '../dtos/service/transaction-with-retry.dto';
import { QueryResult } from './query-result.interface';

export interface DatabaseAdapter<T = unknown> {
  connect(): Promise<void>;
  disconnect(): Promise<void>;
  query<R = T>(dto: QueryDto): Promise<QueryResult<R>>;
  transaction<R>(dto: TransactionDto<R>): Promise<R>;
  transactionWithRetry<R>(dto: TransactionWithRetryDto<R>): Promise<R>;
}
