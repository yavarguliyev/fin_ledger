import { DynamicModule, Module } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { ClientIds, RABBITMQ_SERVICE } from '@common/shared-libs';

import { RabbitmqService } from './services/rabbitmq.service';

@Module({})
export class RabbitmqModule {
  static forRoot (clientId?: ClientIds): DynamicModule {
    const rabbitmqServiceProvider = {
      provide: RabbitmqService,
      useFactory: (configService: ConfigService): RabbitmqService => new RabbitmqService(configService, clientId),
      inject: [ConfigService]
    };

    return {
      module: RabbitmqModule,
      providers: [rabbitmqServiceProvider, { provide: RABBITMQ_SERVICE, useExisting: RabbitmqService }],
      exports: [RabbitmqService, RABBITMQ_SERVICE]
    };
  }
}
