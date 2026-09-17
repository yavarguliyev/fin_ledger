import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';

import { ConfigValidator } from './helpers/env.helper';

@Module({
  imports: [ConfigModule.forRoot({ isGlobal: true, validate: ConfigValidator.validate })],
  providers: [ConfigService],
  exports: [ConfigService]
})
export class EnvModule {}
