import { DynamicModule, Module } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { ClientIds, SMS_SERVICE } from '@common/shared-libs';

import { SmsService } from './services/sms.service';

@Module({})
export class SmsModule {
  static forRoot (clientId?: ClientIds): DynamicModule {
    const sms = {
      provide: SmsService,
      useFactory: (configService: ConfigService): SmsService => new SmsService(configService, clientId),
      inject: [ConfigService]
    };

    return {
      module: SmsModule,
      providers: [sms, { provide: SMS_SERVICE, useExisting: SmsService }],
      exports: [SmsService, SMS_SERVICE]
    };
  }
}
