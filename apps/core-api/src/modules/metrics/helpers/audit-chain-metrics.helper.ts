import { Gauge } from 'prom-client';
import { PostgresService, RequestScope } from '@common/libs';

import { AUDIT_CHAIN } from '../constants/audit-chain.constant';
import { METRICS } from '../constants/metrics.constant';
import { AuditChainRow } from '../interfaces/audit-chain-row.interface';
import { MetricsSourceDto } from '../dtos/metrics-source.dto';

export class AuditChainMetricsHelper {
  private readonly postgresService: PostgresService;
  private readonly breaks: Gauge<string>;
  private checkedAt = 0;

  constructor ({ registry, postgresService }: MetricsSourceDto) {
    this.postgresService = postgresService;
    this.breaks = new Gauge({ name: `${METRICS.PREFIX}${AUDIT_CHAIN.BREAKS}`, help: AUDIT_CHAIN.BREAKS, registers: [registry] });
  }

  async refresh (): Promise<void> {
    if (Date.now() - this.checkedAt < AUDIT_CHAIN.CHECK_EVERY_MS) return;

    const result = await RequestScope.runSystem(() => this.postgresService.getConnection().query<AuditChainRow>({ sql: AUDIT_CHAIN.SQL }));
    this.breaks.set(result.rows[0]?.breaks ?? 0);
    this.checkedAt = Date.now();
  }
}
