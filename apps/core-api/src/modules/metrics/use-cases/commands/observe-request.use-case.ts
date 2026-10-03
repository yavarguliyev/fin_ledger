import { Injectable } from '@nestjs/common';

import { MetricsRegistryHelper } from '../../helpers/metrics-registry.helper';
import { ObserveRequestDto } from '../../dtos/observe-request.dto';

@Injectable()
export class ObserveRequestUseCase {
  constructor (private readonly metrics: MetricsRegistryHelper) {}

  execute ({ method, route, status, seconds }: ObserveRequestDto): void {
    this.metrics.requestDuration.labels(method, route, String(status)).observe(seconds);
  }
}
