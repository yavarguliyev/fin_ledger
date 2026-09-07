import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';

import { validate } from './utils/utils';

@Module({
  imports: [ConfigModule.forRoot({ isGlobal: true, validate })],
  providers: [ConfigService],
  exports: [ConfigService]
})
export class EnvModule {}
