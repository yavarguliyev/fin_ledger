import { Injectable } from '@nestjs/common';

import { MetricsRegistryHelper } from '../../helpers/metrics-registry.helper';

@Injectable()
export class GetMetricsContentTypeUseCase {
  constructor (private readonly metrics: MetricsRegistryHelper) {}

  execute (): string {
    return this.metrics.registry.contentType;
  }
}
