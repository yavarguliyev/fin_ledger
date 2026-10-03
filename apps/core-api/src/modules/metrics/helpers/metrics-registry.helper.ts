import { Inject, Injectable } from '@nestjs/common';
import { collectDefaultMetrics, Gauge, Histogram, Registry } from 'prom-client';
import { PostgresService } from '@common/libs';

import { METRICS } from '../constants/metrics.constant';
import { METRIC_GAUGES } from '../constants/metric-gauges.constant';
import { PAGE_VIEW } from '../constants/page-view.constant';
import { BusinessMetricsHelper } from './business-metrics.helper';
import { AuditChainMetricsHelper } from './audit-chain-metrics.helper';

@Injectable()
export class MetricsRegistryHelper {
  readonly registry = new Registry();
  readonly gauges: Record<string, Gauge<string>>;
  readonly dlqDepth: Gauge<string>;
  readonly requestDuration: Histogram<string>;
  readonly pageViewRequests: Histogram<string>;
  readonly pageViewDuplicates: Histogram<string>;
  readonly business: BusinessMetricsHelper;
  readonly auditChain: AuditChainMetricsHelper;

  constructor (@Inject(PostgresService) postgresService: PostgresService) {
    collectDefaultMetrics({ register: this.registry, prefix: METRICS.PREFIX });

    this.gauges = Object.fromEntries(
      METRIC_GAUGES.NAMES.map(name => [name, new Gauge({ name: `${METRICS.PREFIX}${name}`, help: name, registers: [this.registry] })])
    );

    this.dlqDepth = new Gauge({
      name: `${METRICS.PREFIX}${METRICS.DLQ_DEPTH}`,
      help: METRICS.DLQ_DEPTH,
      labelNames: [METRICS.DLQ_LABEL],
      registers: [this.registry]
    });

    this.requestDuration = new Histogram({
      name: `${METRICS.PREFIX}${METRICS.HTTP_DURATION}`,
      help: METRICS.HTTP_DURATION,
      labelNames: [...METRICS.HTTP_LABELS],
      buckets: [...METRICS.HTTP_BUCKETS],
      registers: [this.registry]
    });

    const pageView = { buckets: [...PAGE_VIEW.BUCKETS], registers: [this.registry] };
    this.pageViewRequests = new Histogram({ ...pageView, name: `${METRICS.PREFIX}${PAGE_VIEW.REQUESTS}`, help: PAGE_VIEW.REQUESTS, labelNames: [...PAGE_VIEW.REQUEST_LABELS] });
    this.pageViewDuplicates = new Histogram({ ...pageView, name: `${METRICS.PREFIX}${PAGE_VIEW.DUPLICATES}`, help: PAGE_VIEW.DUPLICATES, labelNames: [...PAGE_VIEW.DUPLICATE_LABELS] });
    this.business = new BusinessMetricsHelper({ registry: this.registry, postgresService });
    this.auditChain = new AuditChainMetricsHelper({ registry: this.registry, postgresService });
  }
}
