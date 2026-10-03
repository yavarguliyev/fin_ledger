import { Injectable } from '@nestjs/common';

import { GetMetricsContentTypeUseCase } from '../use-cases/queries/get-metrics-content-type.use-case';
import { ScrapeMetricsUseCase } from '../use-cases/queries/scrape-metrics.use-case';
import { ObservePageViewUseCase } from '../use-cases/commands/observe-page-view.use-case';
import { ObserveRequestUseCase } from '../use-cases/commands/observe-request.use-case';
import { PageViewDto } from '../dtos/page-view.dto';
import { ObserveRequestDto } from '../dtos/observe-request.dto';

@Injectable()
export class MetricsService {
  constructor (
    private readonly getMetricsContentTypeUseCase: GetMetricsContentTypeUseCase,
    private readonly scrapeMetricsUseCase: ScrapeMetricsUseCase,
    private readonly observePageViewUseCase: ObservePageViewUseCase,
    private readonly observeRequestUseCase: ObserveRequestUseCase
  ) {}

  contentType (): string {
    return this.getMetricsContentTypeUseCase.execute();
  }

  observePageView (dto: PageViewDto): void {
    return this.observePageViewUseCase.execute(dto);
  }

  observeRequest (dto: ObserveRequestDto): void {
    return this.observeRequestUseCase.execute(dto);
  }

  async scrape (): Promise<string> {
    return this.scrapeMetricsUseCase.execute();
  }
}
