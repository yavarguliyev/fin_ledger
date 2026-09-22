import { Inject, Injectable, InternalServerErrorException, OnModuleDestroy, OnModuleInit } from '@nestjs/common';
import { DATABASE_CONFIG } from '@common/shared-libs';

import { DatabaseAdapter } from '../../interfaces/database-adapter.interface';
import { DATABASE_ADAPTER_MAP } from '../../constants/adapter/database.constant';
import { DatabaseConfig } from '../../interfaces/database-config.interface';
import { AddConnectionDto } from '../../dtos/service/add-connection.dto';
import { ConnectionNameDto } from '../../dtos/service/connection-name.dto';

@Injectable()
export class PostgresService implements OnModuleInit, OnModuleDestroy {
  private adapters = new Map<string, DatabaseAdapter>();
  private defaultAdapter: DatabaseAdapter | null = null;
  private isClosing = false;
  private isClosed = false;

  constructor (@Inject(DATABASE_CONFIG) private readonly config: DatabaseConfig) {}

  async onModuleInit (): Promise<void> {
    await this.addConnection({ name: 'default', config: this.config });
  }

  getWriteConnection = ({ name = 'default' }: ConnectionNameDto = {}): DatabaseAdapter => this.getConnection({ name });

  getConnection ({ name }: ConnectionNameDto = {}): DatabaseAdapter {
    if (!name && this.defaultAdapter) return this.defaultAdapter;
    if (name && this.adapters.has(name)) return this.adapters.get(name)!;
    throw new InternalServerErrorException(`Database connection '${name || 'default'}' not found`);
  }

  getReadConnection ({ name = 'default' }: ConnectionNameDto = {}): DatabaseAdapter {
    const readKey = `${name}_read`;
    if (this.adapters.has(readKey)) return this.adapters.get(readKey)!;
    return this.getConnection({ name });
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

  async closeAllConnections (): Promise<void> {
    if (this.isClosing || this.isClosed) return;

    this.isClosing = true;

    try {
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
}
