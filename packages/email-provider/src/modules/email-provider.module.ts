import { DynamicModule, Module } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { ClientIds, EMAIL_SERVICE } from '@common/shared-libs';

import { EmailProviderService } from './services/email-provider.service';

@Module({})
export class EmailProviderModule {
  static forRoot (clientId?: ClientIds): DynamicModule {
    const emailServiceProvider = {
      provide: EmailProviderService,
      useFactory: (configService: ConfigService): EmailProviderService => new EmailProviderService(configService, clientId),
      inject: [ConfigService]
    };

    return {
      module: EmailProviderModule,
      providers: [emailServiceProvider, { provide: EMAIL_SERVICE, useExisting: EmailProviderService }],
      exports: [EmailProviderService, EMAIL_SERVICE]
    };
  }
}
