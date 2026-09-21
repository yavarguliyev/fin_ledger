import { Injectable, InternalServerErrorException, OnModuleDestroy, ServiceUnavailableException } from '@nestjs/common';
import { Pool, PoolClient } from 'pg';

import { TransactionAdapter } from './transaction.adapter';
import { CommonAdapter } from './common.adapter';
import { DatabaseAdapter } from '../../interfaces/database-adapter.interface';
import { QueryResult } from '../../interfaces/query-result.interface';
import { DatabaseConfig } from '../../interfaces/database-config.interface';
import { DatabaseHelper } from '../helpers/database.helper';
import { TransactionWithRetryDto } from '../../dtos/service/transaction-with-retry.dto';
import { QueryDto } from '../../dtos/adapter/query.dto';
import { AdapterConfigDto } from '../../dtos/adapter/adapter-config.dto';
import { TransactionDto } from '../../dtos/adapter/transaction.dto';

@Injectable()
export class PostgreSQLAdapter extends CommonAdapter implements DatabaseAdapter, OnModuleDestroy {
  private pool: Pool | null = null;
  private isDisconnecting = false;

  private readonly config: DatabaseConfig;

  constructor ({ config }: AdapterConfigDto) {
    super();
    this.config = config;
  }

  isConnected = (): boolean => this.pool !== null;

  async onModuleDestroy (): Promise<void> {
    await this.disconnect();
  }

  async connect (): Promise<void> {
    if (this.pool) return;

    DatabaseHelper.registerPostgresTypeParsers();

    this.pool = new Pool({
      host: this.config.host,
      port: this.config.port,
      user: this.config.username,
      password: this.config.password,
      database: this.config.database,
      ssl: this.config.ssl,
      max: this.config.connectionLimit || 10,
      min: this.config.minLimit || 2,
      idleTimeoutMillis: this.config.idleTimeoutMillis || 30000,
      connectionTimeoutMillis: this.config.connectionTimeoutMillis || 2000
    });

    const client = await this.pool.connect();
    client.release();
  }

  async disconnect (): Promise<void> {
    if (!this.pool || this.isDisconnecting) return;

    this.isDisconnecting = true;

    try {
      const disconnectPromise = this.pool.end();
      const timeoutPromise = new Promise<void>((_, reject) => {
        setTimeout(() => reject(new ServiceUnavailableException('Database disconnect timeout')), 2000);
      });

      await Promise.race([disconnectPromise, timeoutPromise]);
      this.pool = null;
    } catch (error) {
      this.pool = null;
      throw error;
    } finally {
      this.isDisconnecting = false;
    }
  }

  async query<T = unknown> ({ sql, params = [] }: QueryDto): Promise<QueryResult<T>> {
    if (!this.pool) throw new InternalServerErrorException('Database not connected');

    try {
      const result = await this.pool.query(sql, params);
      return { rows: this.validateQueryResult<T>({ rows: result.rows }), rowCount: result.rowCount || 0 };
    } catch (error) {
      throw DatabaseHelper.translateDatabaseError({ error });
    }
  }

  async transaction<R> ({ callback }: TransactionDto<R>): Promise<R> {
    return this.transactionWithRetry({ callback, retries: 1 });
  }

  async transactionWithRetry<R> ({ callback, retries = 3 }: TransactionWithRetryDto<R>): Promise<R> {
    if (!this.pool) throw new InternalServerErrorException('Database not connected');

    let lastError: unknown;

    for (let attempt = 0; attempt < retries; attempt++) {
      const client: PoolClient = await this.pool.connect();

      try {
        await client.query('BEGIN');
        const transactionAdapter = new TransactionAdapter({ client });
        const result = await callback(transactionAdapter);
        await client.query('COMMIT');
        return result;
      } catch (error) {
        await client.query('ROLLBACK');
        lastError = error;

        if (DatabaseHelper.isRetryableDatabaseError({ error })) {
          const delay = Math.pow(2, attempt) * 100;
          await new Promise(resolve => setTimeout(resolve, delay));
          continue;
        }

        throw DatabaseHelper.translateDatabaseError({ error });
      } finally {
        client.release();
      }
    }

    throw DatabaseHelper.translateDatabaseError({ error: lastError });
  }
}
