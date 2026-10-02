import { Module } from '@nestjs/common';
import { APP_INTERCEPTOR } from '@nestjs/core';

import { SharedModule } from '../../shared/shared.module';
import { MetricsController } from './metrics.controller';
import { PageViewController } from './page-view.controller';
import { PageViewService } from './page-view.service';
import { RecordPageViewUseCase } from './use-cases/commands/record-page-view.use-case';
import { MetricsService } from './services/metrics.service';
import { RequestDurationInterceptor } from './interceptors/request-duration.interceptor';
import { LedgerModule } from '../ledger/ledger.module';

@Module({
  imports: [SharedModule, LedgerModule],
  controllers: [MetricsController, PageViewController],
  providers: [MetricsService, PageViewService, RecordPageViewUseCase, { provide: APP_INTERCEPTOR, useClass: RequestDurationInterceptor }],
  exports: [MetricsService]
})
export class MetricsModule {}
