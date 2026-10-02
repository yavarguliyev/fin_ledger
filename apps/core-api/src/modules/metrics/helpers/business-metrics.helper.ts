import { Gauge } from 'prom-client';
import { PostgresService, RequestScope } from '@common/libs';

import { BUSINESS_METRICS } from '../constants/business-metrics.constant';
import { METRICS } from '../constants/metrics.constant';
import { BusinessMetricRow } from '../interfaces/business-metric-row.interface';
import { MetricsSourceDto } from '../dtos/metrics-source.dto';

export class BusinessMetricsHelper {
  private readonly postgresService: PostgresService;
  private readonly payments: Gauge<string>;
  private readonly bets: Gauge<string>;

  constructor ({ registry, postgresService }: MetricsSourceDto) {
    this.postgresService = postgresService;
    this.payments = new Gauge({
      name: `${METRICS.PREFIX}${BUSINESS_METRICS.PAYMENTS}`,
      help: BUSINESS_METRICS.PAYMENTS,
      labelNames: [...BUSINESS_METRICS.PAYMENT_LABELS],
      registers: [registry]
    });
    this.bets = new Gauge({
      name: `${METRICS.PREFIX}${BUSINESS_METRICS.BETS}`,
      help: BUSINESS_METRICS.BETS,
      labelNames: [...BUSINESS_METRICS.BET_LABELS],
      registers: [registry]
    });
  }

  async refresh (): Promise<void> {
    const result = await RequestScope.runSystem(() => this.postgresService.getConnection().query<BusinessMetricRow>({ sql: BUSINESS_METRICS.SQL }));

    BUSINESS_METRICS.PAYMENT_TYPES.forEach(type => BUSINESS_METRICS.PAYMENT_OUTCOMES.forEach(outcome => this.payments.labels(type, outcome).set(0)));
    BUSINESS_METRICS.BET_OUTCOMES.forEach(outcome => this.bets.labels(outcome).set(0));

    result.rows.forEach(row => {
      if (row.kind === BUSINESS_METRICS.BET_KIND) this.bets.labels(row.outcome).set(row.total);
      else this.payments.labels(row.type, row.outcome).set(row.total);
    });
  }
}
