import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { UnknownRecord } from '@common/shared-libs';

import { ConfigValidator } from './helpers/env.helper';
import { EnvironmentVariablesDto } from './dtos/config/environment-variables.dto';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      validate: (config: UnknownRecord): EnvironmentVariablesDto => ConfigValidator.validate({ config })
    })
  ],
  providers: [ConfigService],
  exports: [ConfigService]
})
export class EnvModule {}
