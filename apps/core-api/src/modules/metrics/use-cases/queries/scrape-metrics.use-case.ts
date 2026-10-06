import { Inject, Injectable } from '@nestjs/common';
import { PostgresService, QueueHelper, RABBITMQ_SERVICE, RabbitmqService } from '@common/libs';

import { MetricsRegistryHelper } from '../../helpers/metrics-registry.helper';
import { METRICS } from '../../constants/metrics.constant';
import { OutboxGaugeRow } from '../../interfaces/outbox-gauge-row.interface';
import { LedgerIntegrityJob } from '../../../ledger';
import { NOTIFICATION_QUEUE } from '../../../notification';

@Injectable()
export class ScrapeMetricsUseCase {
  constructor (
    private readonly metrics: MetricsRegistryHelper,
    @Inject(PostgresService) private readonly postgresService: PostgresService,
    @Inject(RABBITMQ_SERVICE) private readonly rabbitmq: RabbitmqService,
    private readonly ledgerIntegrity: LedgerIntegrityJob
  ) {}

  async execute (): Promise<string> {
    await this.refresh();
    return this.metrics.registry.metrics();
  }

  private async refresh (): Promise<void> {
    const stats = this.postgresService.poolStats();
    const { gauges, business, auditChain } = this.metrics;

    gauges[METRICS.POOL_TOTAL]?.set(stats.totalCount);
    gauges[METRICS.POOL_IDLE]?.set(stats.idleCount);
    gauges[METRICS.POOL_WAITING]?.set(stats.waitingCount);

    await Promise.all([this.refreshOutbox(), this.refreshLedger(), this.refreshDeadLetters(), business.refresh(), auditChain.refresh()]);
  }

  private async refreshOutbox (): Promise<void> {
    const result = await this.postgresService.getConnection().query<OutboxGaugeRow>({ sql: METRICS.PENDING_SQL });
    const [row] = result.rows;
    const { gauges } = this.metrics;

    gauges[METRICS.OUTBOX_PENDING]?.set(Number(row?.pending ?? 0));
    gauges[METRICS.OUTBOX_DEAD]?.set(Number(row?.dead ?? 0));
    gauges[METRICS.OUTBOX_LAG]?.set(Number(row?.lag_seconds ?? 0));
  }

  private async refreshLedger (): Promise<void> {
    const report = await this.ledgerIntegrity.check();
    const { gauges } = this.metrics;

    gauges[METRICS.LEDGER_DRIFTED_ACCOUNTS]?.set(report.driftedAccounts);
    gauges[METRICS.LEDGER_DRIFTED_WALLETS]?.set(report.driftedWallets);
    gauges[METRICS.LEDGER_UNBALANCED_CURRENCIES]?.set(report.unbalancedCurrencies.length);
  }

  private async refreshDeadLetters (): Promise<void> {
    const queue = QueueHelper.deadLetterQueue({ queue: `${NOTIFICATION_QUEUE.PREFIX}.${METRICS.DLQ_PROBE_EVENT}` });

    try {
      this.metrics.dlqDepth.labels(queue).set(await this.rabbitmq.queueDepth({ queue }));
    } catch {
      this.metrics.dlqDepth.labels(queue).set(0);
    }
  }
}
