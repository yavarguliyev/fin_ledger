import { Module } from '@nestjs/common';
import { EnvModule } from '@common/libs';

import { CoreModule } from './modules/core.module';

@Module({
  imports: [EnvModule, CoreModule]
})
export class AppModule {}
