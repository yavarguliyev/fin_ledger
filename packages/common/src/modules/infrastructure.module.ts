import { DynamicModule, Module } from '@nestjs/common';
import { APP_FILTER } from '@nestjs/core';
import { ConfigService } from '@nestjs/config';
import { DatabaseConfig, DatabaseModule, OutboxRepository } from '@common/database';
import { KafkaModule } from '@common/kafka';
import { OutboxPublisherService, RabbitmqModule } from '@common/rabbitmq';
import { RedisModule } from '@common/redis';
import { PasswordHandler } from '@common/session';
import { UnifiedExceptionFilter, ClientIds, DatabaseType } from '@common/shared-libs';

@Module({
  providers: [{ provide: APP_FILTER, useClass: UnifiedExceptionFilter }]
})
export class InfrastructureModule {
  static forRoot (clientId?: ClientIds): DynamicModule {
    const dbConfigFactory = (configService: ConfigService): DatabaseConfig => ({
      host: configService.get<string>('DB_HOST', 'localhost'),
      port: configService.get<number>('DB_PORT', 5432) ?? 5432,
      username: configService.get<string>('DB_USERNAME') ?? '',
      password: configService.get<string>('DB_PASSWORD') ?? '',
      database: configService.get<string>('DB_NAME') ?? configService.get<string>('DB_DATABASE') ?? '',
      type: DatabaseType.POSTGRESQL,
      ssl: configService.get<string>('DB_SSL') === 'true',
      connectionLimit: configService.get<number>('DB_CONNECTION_LIMIT', 10) ?? 10,
      minLimit: configService.get<number>('DB_MIN_LIMIT', 2) ?? 2,
      connectionTimeoutMillis: configService.get<number>('DB_CONNECTION_TIMEOUT', 5000) ?? 5000
    });

    const databaseOptions = {
      inject: [ConfigService] as [typeof ConfigService],
      useFactory: dbConfigFactory,
      ...(clientId && { clientId })
    };

    return {
      module: InfrastructureModule,
      imports: [
        DatabaseModule.forRootAsync(databaseOptions),
        RedisModule.forRoot(clientId),
        RabbitmqModule.forRoot(clientId),
        KafkaModule.forRoot(clientId)
      ],
      providers: [PasswordHandler, OutboxRepository, OutboxPublisherService],
      exports: [PasswordHandler, DatabaseModule, RedisModule, RabbitmqModule, KafkaModule, OutboxRepository, OutboxPublisherService]
    };
  }
}
