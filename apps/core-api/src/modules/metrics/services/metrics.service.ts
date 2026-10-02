import { Injectable, Inject } from '@nestjs/common';
import { collectDefaultMetrics, Gauge, Histogram, Registry } from 'prom-client';
import { PostgresService, QueueHelper, RABBITMQ_SERVICE, RabbitmqService } from '@common/libs';

import { METRICS } from '../constants/metrics.constant';
import { ObserveRequestDto } from '../dtos/observe-request.dto';
import { LedgerIntegrityJob } from '../../ledger/jobs/ledger-integrity.job';
import { NOTIFICATION_QUEUE } from '../../notification/constants/messaging/notification-queue.constant';

const GAUGES = [
  METRICS.POOL_TOTAL,
  METRICS.POOL_IDLE,
  METRICS.POOL_WAITING,
  METRICS.OUTBOX_PENDING,
  METRICS.OUTBOX_DEAD,
  METRICS.OUTBOX_LAG,
  METRICS.LEDGER_DRIFTED_ACCOUNTS,
  METRICS.LEDGER_DRIFTED_WALLETS,
  METRICS.LEDGER_UNBALANCED_CURRENCIES
];

@Injectable()
export class MetricsService {
  private readonly registry = new Registry();
  private readonly gauges: Record<string, Gauge<string>>;
  private readonly dlqDepth: Gauge<string>;
  private readonly requestDuration: Histogram<string>;

  constructor (
    @Inject(PostgresService) private readonly postgresService: PostgresService,
    @Inject(RABBITMQ_SERVICE) private readonly rabbitmq: RabbitmqService,
    private readonly ledgerIntegrity: LedgerIntegrityJob
  ) {
    collectDefaultMetrics({ register: this.registry, prefix: METRICS.PREFIX });

    this.gauges = Object.fromEntries(
      GAUGES.map(name => [name, new Gauge({ name: `${METRICS.PREFIX}${name}`, help: name, registers: [this.registry] })])
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
  }

  contentType (): string {
    return this.registry.contentType;
  }

  observeRequest ({ method, route, status, seconds }: ObserveRequestDto): void {
    this.requestDuration.labels(method, route, String(status)).observe(seconds);
  }

  async scrape (): Promise<string> {
    await this.refresh();
    return this.registry.metrics();
  }

  private async refresh (): Promise<void> {
    const stats = this.postgresService.poolStats();

    this.gauges[METRICS.POOL_TOTAL]?.set(stats.totalCount);
    this.gauges[METRICS.POOL_IDLE]?.set(stats.idleCount);
    this.gauges[METRICS.POOL_WAITING]?.set(stats.waitingCount);

    await Promise.all([this.refreshOutbox(), this.refreshLedger(), this.refreshDeadLetters()]);
  }

  private async refreshOutbox (): Promise<void> {
    const result = await this.postgresService.getConnection().query<{ pending: string; dead: string; lag_seconds: string }>({ sql: METRICS.PENDING_SQL });
    const [row] = result.rows;

    this.gauges[METRICS.OUTBOX_PENDING]?.set(Number(row?.pending ?? 0));
    this.gauges[METRICS.OUTBOX_DEAD]?.set(Number(row?.dead ?? 0));
    this.gauges[METRICS.OUTBOX_LAG]?.set(Number(row?.lag_seconds ?? 0));
  }

  private async refreshLedger (): Promise<void> {
    const report = await this.ledgerIntegrity.check();

    this.gauges[METRICS.LEDGER_DRIFTED_ACCOUNTS]?.set(report.driftedAccounts);
    this.gauges[METRICS.LEDGER_DRIFTED_WALLETS]?.set(report.driftedWallets);
    this.gauges[METRICS.LEDGER_UNBALANCED_CURRENCIES]?.set(report.unbalancedCurrencies.length);
  }

  private async refreshDeadLetters (): Promise<void> {
    const queue = QueueHelper.deadLetterQueue({ queue: `${NOTIFICATION_QUEUE.PREFIX}.${METRICS.DLQ_PROBE_EVENT}` });

    try {
      this.dlqDepth.labels(queue).set(await this.rabbitmq.queueDepth({ queue }));
    } catch {
      this.dlqDepth.labels(queue).set(0);
    }
  }
}
