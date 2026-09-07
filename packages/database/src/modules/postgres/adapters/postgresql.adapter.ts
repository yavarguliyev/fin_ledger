import { Injectable, InternalServerErrorException, OnModuleDestroy, ServiceUnavailableException } from '@nestjs/common';
import { Pool, PoolClient } from 'pg';

import { TransactionAdapter } from './transaction.adapter';
import { CommonAdapter } from './common.adapter';
import { DatabaseAdapter, QueryResult } from '../../interfaces/database.interface';
import { DatabaseConfig } from '../../interfaces/database.interface';

@Injectable()
export class PostgreSQLAdapter extends CommonAdapter implements DatabaseAdapter, OnModuleDestroy {
  private pool: Pool | null = null;
  private isDisconnecting = false;

  constructor (private readonly config: DatabaseConfig) {
    super();
  }

  isConnected = (): boolean => this.pool !== null;

  async onModuleDestroy (): Promise<void> {
    await this.disconnect();
  }

  async connect (): Promise<void> {
    if (this.pool) return;

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

  async query<T = unknown> (sql: string, params: unknown[] = []): Promise<QueryResult<T>> {
    if (!this.pool) throw new InternalServerErrorException('Database not connected');
    const result = await this.pool.query(sql, params);
    return { rows: this.validateQueryResult<T>(result.rows), rowCount: result.rowCount || 0 };
  }

  async transaction<R> (callback: (adapter: DatabaseAdapter) => Promise<R>): Promise<R> {
    return this.transactionWithRetry(callback, 1);
  }

  async transactionWithRetry<R> (callback: (adapter: DatabaseAdapter) => Promise<R>, retries = 3): Promise<R> {
    if (!this.pool) throw new InternalServerErrorException('Database not connected');

    let lastError: unknown;

    for (let attempt = 0; attempt < retries; attempt++) {
      const client: PoolClient = await this.pool.connect();

      try {
        await client.query('BEGIN');
        const transactionAdapter = new TransactionAdapter(client);
        const result = await callback(transactionAdapter);
        await client.query('COMMIT');
        return result;
      } catch (error) {
        await client.query('ROLLBACK');
        lastError = error;

        if (error && typeof error === 'object' && 'code' in error) {
          if (error.code === '40P01' || error.code === '40001') {
            const delay = Math.pow(2, attempt) * 100;
            await new Promise(resolve => setTimeout(resolve, delay));
            continue;
          }
        }
        throw error;
      } finally {
        client.release();
      }
    }

    throw lastError;
  }
}
