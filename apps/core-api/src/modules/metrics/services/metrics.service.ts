import { Injectable, Inject } from '@nestjs/common';
import { collectDefaultMetrics, Gauge, Registry } from 'prom-client';
import { PostgresService } from '@common/libs';

import { METRICS } from '../constants/metrics.constant';

@Injectable()
export class MetricsService {
  private readonly registry = new Registry();
  private readonly gauges: Record<string, Gauge<string>>;

  constructor (@Inject(PostgresService) private readonly postgresService: PostgresService) {
    collectDefaultMetrics({ register: this.registry, prefix: METRICS.PREFIX });

    this.gauges = Object.fromEntries(
      [METRICS.POOL_TOTAL, METRICS.POOL_IDLE, METRICS.POOL_WAITING, METRICS.OUTBOX_PENDING, METRICS.OUTBOX_DEAD].map(name => [
        name,
        new Gauge({ name: `${METRICS.PREFIX}${name}`, help: name, registers: [this.registry] })
      ])
    );
  }

  contentType (): string {
    return this.registry.contentType;
  }

  async scrape (): Promise<string> {
    await this.refresh();
    return this.registry.metrics();
  }

  private async refresh (): Promise<void> {
    const connection = this.postgresService.getConnection();
    const stats = this.postgresService.poolStats();

    this.gauges[METRICS.POOL_TOTAL]?.set(stats.totalCount);
    this.gauges[METRICS.POOL_IDLE]?.set(stats.idleCount);
    this.gauges[METRICS.POOL_WAITING]?.set(stats.waitingCount);

    const result = await connection.query<{ pending: string; dead: string }>({ sql: METRICS.PENDING_SQL });
    const [row] = result.rows;

    this.gauges[METRICS.OUTBOX_PENDING]?.set(Number(row?.pending ?? 0));
    this.gauges[METRICS.OUTBOX_DEAD]?.set(Number(row?.dead ?? 0));
  }
}
