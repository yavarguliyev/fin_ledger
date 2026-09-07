import { DynamicModule, Module } from '@nestjs/common';
import { DiscoveryModule } from '@nestjs/core';
import { ClientIds, KAFKA_CLIENT_ID, KAFKA_SERVICE } from '@common/shared-libs';

import { KafkaService } from './services/kafka.service';
import { KafkaConsumerService } from './services/kafka-consumer.service';

@Module({})
export class KafkaModule {
  static forRoot (clientId?: ClientIds): DynamicModule {
    return {
      module: KafkaModule,
      imports: [DiscoveryModule],
      providers: [
        {
          provide: KAFKA_CLIENT_ID,
          useValue: clientId
        },
        KafkaService,
        KafkaConsumerService,
        {
          provide: KAFKA_SERVICE,
          useExisting: KafkaService
        }
      ],
      exports: [KafkaService, KafkaConsumerService, KAFKA_SERVICE]
    };
  }
}
