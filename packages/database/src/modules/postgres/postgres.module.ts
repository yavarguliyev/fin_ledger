import { DynamicModule, Module } from '@nestjs/common';
import { DATABASE_CONFIG } from '@common/shared-libs';

import { PostgresService } from './services/postgres.service';
import { DatabaseAsyncOptionsDto } from '../dtos/module/database-async-options.dto';

@Module({})
export class PostgresModule {
  static forRootAsync (options: DatabaseAsyncOptionsDto): DynamicModule {
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
