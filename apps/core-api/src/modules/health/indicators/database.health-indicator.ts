import { Inject, Injectable } from '@nestjs/common';
import { HealthIndicatorService, HealthIndicatorResult } from '@nestjs/terminus';
import { BaseHelper, PostgresService } from '@common/libs';

import { HEALTH } from '../constants/health.constant';

@Injectable()
export class DatabaseHealthIndicator {
  constructor (
    @Inject(PostgresService) private readonly postgresService: PostgresService,
    private readonly indicator: HealthIndicatorService
  ) {}

  async isHealthy (): Promise<HealthIndicatorResult> {
    const check = this.indicator.check(HEALTH.DATABASE_KEY);

    try {
      await this.postgresService.getConnection().query({ sql: HEALTH.PING_SQL });
      const { totalCount, idleCount, waitingCount } = this.postgresService.poolStats();
      return check.up({ totalCount, idleCount, waitingCount });
    } catch (error) {
      return check.down({ message: BaseHelper.errorResponse({ error }).message });
    }
  }
}
