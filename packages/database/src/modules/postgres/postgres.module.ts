import { DynamicModule, Module } from '@nestjs/common';
import { DATABASE_CONFIG } from '@common/shared-libs';

import { PostgresService } from './services/postgres.service';
import { DatabaseAsyncOptions } from '../interfaces/database.interface';

@Module({})
export class PostgresModule {
  static forRootAsync (options: DatabaseAsyncOptions): DynamicModule {
    return {
      module: PostgresModule,
      providers: [
        {
          provide: DATABASE_CONFIG,
          useFactory: options.useFactory,
          inject: options.inject
        },
        PostgresService
      ],
      exports: [PostgresService]
    };
  }
}
