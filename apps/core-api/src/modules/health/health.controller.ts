import { Controller, Get } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { HealthCheck, HealthCheckResult, HealthCheckService, HealthIndicatorResult } from '@nestjs/terminus';
import { ENVIRONMENT_CONSTANTS } from '@common/libs';

import { DatabaseHealthIndicator } from './indicators/database.health-indicator';
import { HEALTH } from './constants/health.constant';

@ApiTags(HEALTH.TAG)
@Controller({ path: ENVIRONMENT_CONSTANTS.RESOURCES.HEALTH, version: ENVIRONMENT_CONSTANTS.VERSION.V1 })
export class HealthController {
  constructor (
    private readonly health: HealthCheckService,
    private readonly database: DatabaseHealthIndicator
  ) {}

  @Get(HEALTH.LIVE_PATH)
  live (): { status: string } {
    return { status: HEALTH.OK };
  }

  @Get(HEALTH.READY_PATH)
  @HealthCheck()
  ready (): Promise<HealthCheckResult> {
    return this.health.check([(): Promise<HealthIndicatorResult> => this.database.isHealthy()]);
  }
}
