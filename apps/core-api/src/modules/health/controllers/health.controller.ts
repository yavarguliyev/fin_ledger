import { Controller, Get, VERSION_NEUTRAL } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { HealthCheck, HealthCheckResult, HealthCheckService, HealthIndicatorResult } from '@nestjs/terminus';
import { ENVIRONMENT_CONSTANTS } from '@common/libs';

import { BrokerHealthIndicator } from '../indicators/broker.health-indicator';
import { DatabaseHealthIndicator } from '../indicators/database.health-indicator';
import { RedisHealthIndicator } from '../indicators/redis.health-indicator';
import { HEALTH } from '../constants/health.constant';

@ApiTags(HEALTH.TAG)
@Controller({ path: ENVIRONMENT_CONSTANTS.RESOURCES.HEALTH, version: VERSION_NEUTRAL })
export class HealthController {
  constructor (
    private readonly health: HealthCheckService,
    private readonly database: DatabaseHealthIndicator,
    private readonly redis: RedisHealthIndicator,
    private readonly broker: BrokerHealthIndicator
  ) {}

  @Get(HEALTH.LIVE_PATH)
  live (): { status: string } {
    return { status: HEALTH.OK };
  }

  @Get(HEALTH.READY_PATH)
  @HealthCheck()
  ready (): Promise<HealthCheckResult> {
    return this.health.check([
      (): Promise<HealthIndicatorResult> => this.database.isHealthy(),
      (): Promise<HealthIndicatorResult> => this.redis.isHealthy(),
      (): Promise<HealthIndicatorResult> => this.broker.isHealthy()
    ]);
  }
}
