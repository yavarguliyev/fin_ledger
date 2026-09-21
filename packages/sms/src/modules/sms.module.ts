import { DynamicModule, Module } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { ClientIdDto, SMS_SERVICE } from '@common/shared-libs';

import { SmsService } from './services/sms.service';

@Module({})
export class SmsModule {
  static forRoot ({ clientId }: ClientIdDto = {}): DynamicModule {
    const sms = {
      provide: SmsService,
      useFactory: (configService: ConfigService): SmsService => new SmsService({ configService, ...(clientId && { clientId }) }),
      inject: [ConfigService]
    };

    return {
      module: SmsModule,
      providers: [sms, { provide: SMS_SERVICE, useExisting: SmsService }],
      exports: [SmsService, SMS_SERVICE]
    };
  }
}
