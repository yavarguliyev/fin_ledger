import { Module } from '@nestjs/common';
import { APP_INTERCEPTOR } from '@nestjs/core';

import { SharedModule } from '../../shared/shared.module';
import { MetricsController } from './metrics.controller';
import { PageViewController } from './page-view.controller';
import { PageViewService } from './page-view.service';
import { RecordPageViewUseCase } from './use-cases/commands/record-page-view.use-case';
import { MetricsService } from './services/metrics.service';
import { MetricsRegistryHelper } from './helpers/metrics-registry.helper';
import { GetMetricsContentTypeUseCase } from './use-cases/queries/get-metrics-content-type.use-case';
import { ScrapeMetricsUseCase } from './use-cases/queries/scrape-metrics.use-case';
import { ObservePageViewUseCase } from './use-cases/commands/observe-page-view.use-case';
import { ObserveRequestUseCase } from './use-cases/commands/observe-request.use-case';
import { RequestDurationInterceptor } from './interceptors/request-duration.interceptor';
import { LedgerModule } from '../ledger/ledger.module';

@Module({
  imports: [SharedModule, LedgerModule],
  controllers: [MetricsController, PageViewController],
  providers: [
    MetricsService,
    MetricsRegistryHelper,
    GetMetricsContentTypeUseCase,
    ScrapeMetricsUseCase,
    ObservePageViewUseCase,
    ObserveRequestUseCase,
    PageViewService,
    RecordPageViewUseCase,
    { provide: APP_INTERCEPTOR, useClass: RequestDurationInterceptor }
  ],
  exports: [MetricsService]
})
export class MetricsModule {}
