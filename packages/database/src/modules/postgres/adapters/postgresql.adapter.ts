import { Injectable, InternalServerErrorException, Logger, OnModuleDestroy, ServiceUnavailableException } from '@nestjs/common';
import { Pool, PoolClient } from 'pg';
import { BaseHelper, RequestScope } from '@common/shared-libs';

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
import { PoolHelper } from '../helpers/pool.helper';
import { POOL_CONSTANTS } from '../../constants/pool/pool.constant';
import { PoolStats } from '../../interfaces/pool-stats.interface';

@Injectable()
export class PostgreSQLAdapter extends CommonAdapter implements DatabaseAdapter, OnModuleDestroy {
  private pool: Pool | null = null;
  private isDisconnecting = false;
  private readonly logger = new Logger(PostgreSQLAdapter.name);

  private readonly config: DatabaseConfig;

  constructor ({ config }: AdapterConfigDto) {
    super();
    this.config = config;
  }

  async onModuleDestroy (): Promise<void> {
    await this.disconnect();
  }

  async connect (): Promise<void> {
    if (this.pool) return;

    DatabaseHelper.registerPostgresTypeParsers();

    this.pool = new Pool(PoolHelper.buildConfig({ config: this.config }));
    this.pool.on('error', error => this.logger.error(`Idle database client failed: ${BaseHelper.errorResponse({ error }).message}`));

    const client = await this.pool.connect();
    client.release();
  }

  async disconnect (): Promise<void> {
    if (!this.pool || this.isDisconnecting) return;

    this.isDisconnecting = true;

    try {
      const disconnectPromise = this.pool.end();
      const timeoutPromise = new Promise<void>((_, reject) => {
        setTimeout(() => reject(new ServiceUnavailableException('Database disconnect timeout')), POOL_CONSTANTS.DISCONNECT_TIMEOUT_MS);
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

    const actor = RequestScope.actorId();
    if (actor && !RequestScope.isSystem()) return this.transaction({ callback: adapter => adapter.query<T>({ sql, params }) });

    try {
      const result = await this.pool.query(sql, params);
      return { rows: this.validateQueryResult<T>({ rows: result.rows }), rowCount: result.rowCount || 0 };
    } catch (error) {
      throw DatabaseHelper.translateDatabaseError({ error });
    }
  }

  async transaction<R> ({ callback, actor }: TransactionDto<R>): Promise<R> {
    return this.transactionWithRetry({ callback, retries: 1, ...(actor && { actor }) });
  }

  poolStats (): PoolStats {
    if (!this.pool) return { totalCount: 0, idleCount: 0, waitingCount: 0 };

    const { totalCount, idleCount, waitingCount } = this.pool;

    return { totalCount, idleCount, waitingCount };
  }

  async transactionWithRetry<R> ({ callback, retries = 3, actor }: TransactionWithRetryDto<R>): Promise<R> {
    const currentActor = actor ?? RequestScope.actorId();
    if (!this.pool) throw new InternalServerErrorException('Database not connected');

    let lastError: unknown;

    for (let attempt = 0; attempt < retries; attempt++) {
      const client: PoolClient = await this.pool.connect();
      let committing = false;
      let broken = false;

      try {
        await client.query('BEGIN');
        if (currentActor) await client.query(POOL_CONSTANTS.SET_ACTOR_SQL, [POOL_CONSTANTS.ACTOR_SETTING, currentActor]);

        const result = await callback(new TransactionAdapter({ client }));

        committing = true;
        await client.query('COMMIT');

        return result;
      } catch (error) {
        lastError = error;
        broken = committing || !(await this.rollback({ client }));

        if (!committing && DatabaseHelper.isRetryableTransactionError({ error }) && attempt < retries - 1) {
          await new Promise(resolve => setTimeout(resolve, 2 ** attempt * POOL_CONSTANTS.RETRY_BACKOFF_BASE_MS));
          continue;
        }

        throw DatabaseHelper.translateDatabaseError({ error });
      } finally {
        client.release(broken || undefined);
      }
    }

    throw DatabaseHelper.translateDatabaseError({ error: lastError });
  }

  private async rollback ({ client }: { client: PoolClient }): Promise<boolean> {
    try {
      await client.query('ROLLBACK');
      return true;
    } catch (error) {
      this.logger.warn(`Rollback failed, discarding the connection: ${BaseHelper.errorResponse({ error }).message}`);
      return false;
    }
  }
}
