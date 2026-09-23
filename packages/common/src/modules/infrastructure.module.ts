import { DynamicModule, Module } from '@nestjs/common';
import { APP_FILTER } from '@nestjs/core';
import { ConfigService } from '@nestjs/config';
import { DatabaseConfig, DatabaseModule, OutboxRepository } from '@common/database';
import { KafkaModule } from '@common/kafka';
import { OutboxPublisherService, RabbitmqModule } from '@common/rabbitmq';
import { RedisModule } from '@common/redis';
import { UnifiedExceptionFilter, ClientIdDto } from '@common/shared-libs';
import { PaymentProviderModule } from '@common/payment-provider';
import { SmsModule } from '@common/sms';

import { DatabaseConfigHelper } from './helpers/database-config.helper';

@Module({
  providers: [{ provide: APP_FILTER, useClass: UnifiedExceptionFilter }]
})
export class InfrastructureModule {
  static forRoot ({ clientId }: ClientIdDto): DynamicModule {
    const dbConfigFactory = (configService: ConfigService): DatabaseConfig => DatabaseConfigHelper.fromEnv({ configService, ...(clientId && { clientId }) });

    const databaseOptions = {
      inject: [ConfigService] as [typeof ConfigService],
      useFactory: dbConfigFactory,
      ...(clientId && { clientId })
    };

    return {
      module: InfrastructureModule,
      imports: [
        DatabaseModule.forRootAsync(databaseOptions),
        RedisModule.forRoot({ ...(clientId && { clientId }) }),
        RabbitmqModule.forRoot({ ...(clientId && { clientId }) }),
        KafkaModule.forRoot({ ...(clientId && { clientId }) }),
        PaymentProviderModule.forRoot(),
        SmsModule.forRoot({ ...(clientId && { clientId }) })
      ],
      providers: [OutboxRepository, OutboxPublisherService],
      exports: [DatabaseModule, RedisModule, RabbitmqModule, KafkaModule, PaymentProviderModule, SmsModule, OutboxRepository, OutboxPublisherService]
    };
  }
}
