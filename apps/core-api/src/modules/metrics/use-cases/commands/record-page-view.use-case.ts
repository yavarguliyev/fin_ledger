import { Injectable } from '@nestjs/common';

import { PAGE_VIEW } from '../../constants/page-view.constant';
import { PageViewDto } from '../../dtos/page-view.dto';
import { MetricsService } from '../../services/metrics.service';

@Injectable()
export class RecordPageViewUseCase {
  private readonly routes = new Set<string>();

  constructor (private readonly metricsService: MetricsService) {}

  execute ({ route, initialCalls, laterCalls, duplicates }: PageViewDto): void {
    if (!this.routes.has(route) && this.routes.size < PAGE_VIEW.MAX_ROUTES) this.routes.add(route);
    const label = this.routes.has(route) ? route : PAGE_VIEW.OTHER_ROUTE;
    this.metricsService.observePageView({ route: label, initialCalls, laterCalls, duplicates });
  }
}
