import { Injectable } from '@nestjs/common';

import { MetricsRegistryHelper } from '../../helpers/metrics-registry.helper';
import { PAGE_VIEW } from '../../constants/page-view.constant';
import { PageViewDto } from '../../dtos/page-view.dto';

@Injectable()
export class ObservePageViewUseCase {
  constructor (private readonly metrics: MetricsRegistryHelper) {}

  execute ({ route, initialCalls, laterCalls, duplicates }: PageViewDto): void {
    this.metrics.pageViewRequests.labels(route, PAGE_VIEW.INITIAL_PHASE).observe(initialCalls);
    this.metrics.pageViewRequests.labels(route, PAGE_VIEW.LATER_PHASE).observe(laterCalls);
    this.metrics.pageViewDuplicates.labels(route).observe(duplicates);
  }
}
