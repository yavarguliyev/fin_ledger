import { ConfigService } from '@nestjs/config';
import {
  JoinClauseTypes,
  ClientIds,
  DatabaseType,
  OrderDirection,
  UnknownRecord,
  WhereCondition,
  AggregateType,
  DomainEventType,
  OutboxStatus
} from '@common/shared-libs';

export interface ColumnMapping {
  readonly [key: string]: string;
}

export interface JoinClause {
  readonly table: string;
  readonly left: string;
  readonly right: string;
  readonly type: JoinClauseTypes;
}

export interface DatabaseConfig {
  readonly clientId?: ClientIds;

  readonly ssl?: boolean;
  readonly minLimit?: number;
  readonly connectionTimeoutMillis?: number;
  readonly idleTimeoutMillis?: number;
  readonly replicaHosts?: string[];

  readonly type: DatabaseType;

  readonly host: string;
  readonly port: number;
  readonly username: string;
  readonly password: string;
  readonly database: string;
  readonly connectionLimit: number;
}

export interface QueryWithPaginationOptions {
  readonly orderBy?: string;
  readonly page?: number;
  readonly limit?: number;
  readonly offset?: number;
  readonly orderDirection?: OrderDirection;
  readonly searchFields?: string[];

  where?: UnknownRecord | WhereCondition[];
  search?: { fields: string[]; term: string };
}

export interface CreateEventInput {
  readonly aggregateId: string;
  readonly payload: UnknownRecord;
  readonly aggregateType: AggregateType;
  readonly eventType: DomainEventType;
}

export interface OutboxBaseFields extends CreateEventInput {
  readonly id: string;
  readonly createdAt: Date;
  readonly publishedAt: Date | null;
  readonly status: OutboxStatus;
}

export interface DatabaseAsyncOptions {
  readonly clientId?: ClientIds;
  readonly inject: [typeof ConfigService];
  useFactory: (configService: ConfigService) => DatabaseConfig;
}

export interface BuildSetClause {
  readonly setClause: string;
  readonly paramIndex: number;
  readonly params: unknown[];
}

export interface BuildSelectQuery {
  readonly query: string;
  readonly params: unknown[];
}

export interface BuildConditions {
  readonly conditions: string[];
  readonly paramIndex: number;
}

export interface QueryResult<T = unknown> {
  readonly rowCount: number;
  readonly rows: T[];
}

export interface QueryPaginationOptionsResults<T> {
  readonly data: T[];
  readonly total: number;
  readonly page: number;
  readonly limit: number;
  readonly totalPages: number;
}

export interface DatabaseAdapter<T = unknown> {
  connect(): Promise<void>;
  disconnect(): Promise<void>;
  isConnected(): boolean;
  query<R = T>(sql: string, params?: unknown[]): Promise<QueryResult<R>>;
  transaction<R>(callback: (adapter: DatabaseAdapter<T>) => Promise<R>): Promise<R>;
  transactionWithRetry<R>(callback: (adapter: DatabaseAdapter<T>) => Promise<R>, retries?: number): Promise<R>;
}
