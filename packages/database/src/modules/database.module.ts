import { DynamicModule, Module } from '@nestjs/common';

import { PostgresModule } from './postgres/postgres.module';
import { DatabaseAsyncOptions } from './interfaces/database.interface';

@Module({})
export class DatabaseModule {
  static forRootAsync (options: DatabaseAsyncOptions): DynamicModule {
    return {
      module: DatabaseModule,
      imports: [PostgresModule.forRootAsync({ ...options, clientId: options.clientId! })],
      exports: [PostgresModule]
    };
  }
}
