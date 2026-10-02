import { Inject, Injectable, InternalServerErrorException, OnModuleDestroy, OnModuleInit } from '@nestjs/common';
import { DATABASE_CONFIG, RequestScope } from '@common/shared-libs';

import { DatabaseAdapter } from '../../interfaces/database-adapter.interface';
import { DATABASE_ADAPTER_MAP } from '../../constants/adapter/database.constant';
import { DatabaseConfig } from '../../interfaces/database-config.interface';
import { AddConnectionDto } from '../../dtos/service/add-connection.dto';
import { ConnectionNameDto } from '../../dtos/service/connection-name.dto';
import { DATABASE_CONNECTIONS } from '../../constants/adapter/connections.constant';
import { PoolStats } from '../../interfaces/pool-stats.interface';
import { PostgreSQLAdapter } from '../adapters/postgresql.adapter';
import { NotificationListener } from '../helpers/notification-listener.helper';
import { ListenDto } from '../../dtos/notify/listen.dto';

@Injectable()
export class PostgresService implements OnModuleInit, OnModuleDestroy {
  private readonly listeners: NotificationListener[] = [];

  private adapters = new Map<string, DatabaseAdapter>();
  private defaultAdapter: DatabaseAdapter | null = null;
  private isClosing = false;
  private isClosed = false;

  constructor (@Inject(DATABASE_CONFIG) private readonly config: DatabaseConfig) {}

  getWriteConnection = ({ name = 'default' }: ConnectionNameDto = {}): DatabaseAdapter => this.getConnection({ name });

  getConnection ({ name }: ConnectionNameDto = {}): DatabaseAdapter {
    const resolved = this.resolveConnectionName({ ...(name && { name }) });

    if (resolved && this.adapters.has(resolved)) return this.adapters.get(resolved)!;
    if (!resolved && this.defaultAdapter) return this.defaultAdapter;

    throw new InternalServerErrorException(`Database connection '${resolved || DATABASE_CONNECTIONS.DEFAULT}' not found`);
  }

  poolStats ({ name }: ConnectionNameDto = {}): PoolStats {
    const adapter = this.getConnection(name ? { name } : {});
    return adapter instanceof PostgreSQLAdapter ? adapter.poolStats() : { totalCount: 0, idleCount: 0, waitingCount: 0 };
  }

  getReadConnection ({ name = 'default' }: ConnectionNameDto = {}): DatabaseAdapter {
    const readKey = `${name}_read`;
    if (this.adapters.has(readKey)) return this.adapters.get(readKey)!;
    return this.getConnection({ name });
  }

  async onModuleInit (): Promise<void> {
    await this.addConnection({ name: DATABASE_CONNECTIONS.DEFAULT, config: this.config });

    if (this.config.workerUsername && this.config.workerPassword) {
      await this.addConnection({
        name: DATABASE_CONNECTIONS.WORKER,
        config: { ...this.config, username: this.config.workerUsername, password: this.config.workerPassword }
      });
    }
  }

  async addConnection ({ name, config, isReadOnly = false }: AddConnectionDto): Promise<void> {
    const AdapterClass = DATABASE_ADAPTER_MAP[config.type];

    if (!AdapterClass) {
      throw new InternalServerErrorException(
        `No database adapter registered for type '${config.type}'. Supported types: ${Object.keys(DATABASE_ADAPTER_MAP).join(', ')}`
      );
    }

    const adapter = new AdapterClass({ config });
    await adapter.connect();

    const connectionKey = isReadOnly ? `${name}_read` : name;
    this.adapters.set(connectionKey, adapter);

    if (!isReadOnly && !this.defaultAdapter) this.defaultAdapter = adapter;
  }

  async listen ({ channel, onNotify }: ListenDto): Promise<NotificationListener> {
    const config = this.config.workerUsername && this.config.workerPassword
      ? { ...this.config, username: this.config.workerUsername, password: this.config.workerPassword }
      : this.config;
    const listener = new NotificationListener({ config, channel, onNotify });
    this.listeners.push(listener);
    await listener.start();
    return listener;
  }

  async closeAllConnections (): Promise<void> {
    if (this.isClosing || this.isClosed) return;

    this.isClosing = true;

    try {
      await Promise.all(this.listeners.map(listener => listener.stop()));
      const disconnectPromises = Array.from(this.adapters.values()).map(adapter => adapter.disconnect());
      await Promise.all(disconnectPromises);

      this.adapters.clear();
      this.defaultAdapter = null;
      this.isClosed = true;
    } finally {
      this.isClosing = false;
    }
  }

  async onModuleDestroy (): Promise<void> {
    await this.closeAllConnections();
  }

  private resolveConnectionName ({ name }: ConnectionNameDto = {}): string | undefined {
    const isDefault = !name || name === DATABASE_CONNECTIONS.DEFAULT;
    if (isDefault && RequestScope.isSystem() && this.adapters.has(DATABASE_CONNECTIONS.WORKER)) return DATABASE_CONNECTIONS.WORKER;
    return name;
  }
}
