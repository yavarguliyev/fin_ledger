import { Controller, Get, Header } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { ENVIRONMENT_CONSTANTS } from '@common/libs';

import { SHARED_CONSTANTS } from '../../shared/constants/modules/shared.constant';
import { MetricsService } from './services/metrics.service';
import { METRICS } from './constants/metrics.constant';

@ApiTags(SHARED_CONSTANTS.METRICS.key)
@Controller({ path: ENVIRONMENT_CONSTANTS.RESOURCES.METRICS, version: ENVIRONMENT_CONSTANTS.VERSION.V1 })
export class MetricsController {
  constructor (private readonly metricsService: MetricsService) {}

  @Get()
  @Header(METRICS.CONTENT_TYPE_HEADER, 'text/plain; version=0.0.4; charset=utf-8')
  async metrics (): Promise<string> {
    return this.metricsService.scrape();
  }
}
