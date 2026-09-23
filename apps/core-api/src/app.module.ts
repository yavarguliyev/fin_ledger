import { MiddlewareConsumer, Module, NestModule } from '@nestjs/common';
import { CorrelationIdMiddleware, EnvModule } from '@common/libs';

import { CoreModule } from './modules/core.module';

@Module({
  imports: [EnvModule, CoreModule]
})
export class AppModule implements NestModule {
  configure (consumer: MiddlewareConsumer): void {
    consumer.apply(CorrelationIdMiddleware).forRoutes('*');
  }
}
