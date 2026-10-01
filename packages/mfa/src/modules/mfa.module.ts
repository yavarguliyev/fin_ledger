import { DynamicModule, Module } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

import { TotpService } from './services/totp.service';

@Module({})
export class MfaModule {
  static forRoot (): DynamicModule {
    const totp = {
      provide: TotpService,
      useFactory: (configService: ConfigService): TotpService => new TotpService({ configService }),
      inject: [ConfigService]
    };

    return { module: MfaModule, providers: [totp], exports: [TotpService] };
  }
}
