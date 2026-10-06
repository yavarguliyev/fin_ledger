import { DynamicModule, Module } from '@nestjs/common';
import { APP_FILTER } from '@nestjs/core';
import { ConfigService } from '@nestjs/config';
import { DatabaseConfig, DatabaseModule, OutboxRepository } from '@common/database';
import { KafkaModule } from '@common/kafka';
import { PaymentProviderModule } from '@common/payment-provider';
import { MessageBroker } from '@common/messaging';
import { OutboxPublisherService } from '@common/rabbitmq';
import { RedisModule } from '@common/redis';
import { UnifiedExceptionFilter, ClientIdDto, MESSAGE_BROKER } from '@common/shared-libs';
import { SmsModule } from '@common/sms';

import { DatabaseConfigHelper } from './helpers/database-config.helper';
import { MessageBrokerHelper } from './helpers/message-broker.helper';

@Module({
  providers: [{ provide: APP_FILTER, useClass: UnifiedExceptionFilter }]
})
export class InfrastructureModule {
  static forRoot ({ clientId }: ClientIdDto): DynamicModule {
    const dbConfigFactory = (configService: ConfigService): DatabaseConfig =>
      DatabaseConfigHelper.fromEnv({ configService, ...(clientId && { clientId }) });

    const databaseOptions = {
      inject: [ConfigService] as [typeof ConfigService],
      useFactory: dbConfigFactory,
      ...(clientId && { clientId })
    };

    const messageBroker = {
      provide: MESSAGE_BROKER,
      useFactory: (configService: ConfigService): MessageBroker => MessageBrokerHelper.create({ configService, ...(clientId && { clientId }) }),
      inject: [ConfigService]
    };

    return {
      module: InfrastructureModule,
      imports: [
        DatabaseModule.forRootAsync(databaseOptions),
        RedisModule.forRoot({ ...(clientId && { clientId }) }),
        KafkaModule.forRoot({ ...(clientId && { clientId }) }),
        PaymentProviderModule.forRoot(),
        SmsModule.forRoot({ ...(clientId && { clientId }) })
      ],
      providers: [messageBroker, OutboxRepository, OutboxPublisherService],
      exports: [DatabaseModule, RedisModule, MESSAGE_BROKER, KafkaModule, PaymentProviderModule, SmsModule, OutboxRepository, OutboxPublisherService]
    };
  }
}
