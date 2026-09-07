import { DynamicModule, Module } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { ClientIds, EMAIL_SERVICE } from '@common/shared-libs';

import { MailerService } from './services/mailer.service';

@Module({})
export class MailerModule {
  static forRoot (clientId?: ClientIds): DynamicModule {
    const mailer = {
      provide: MailerService,
      useFactory: (configService: ConfigService): MailerService => new MailerService(configService, clientId),
      inject: [ConfigService]
    };

    return {
      module: MailerModule,
      providers: [mailer, { provide: EMAIL_SERVICE, useExisting: MailerService }],
      exports: [MailerService, EMAIL_SERVICE]
    };
  }
}
