import { DynamicModule, Module } from '@nestjs/common';

import { PostgresModule } from './postgres/postgres.module';
import { DatabaseAsyncOptionsDto } from './dtos/module/database-async-options.dto';

@Module({})
export class DatabaseModule {
  static forRootAsync (options: DatabaseAsyncOptionsDto): DynamicModule {
    return {
      module: DatabaseModule,
      global: true,
      imports: [PostgresModule.forRootAsync({ ...options, clientId: options.clientId! })],
      exports: [PostgresModule]
    };
  }
}
