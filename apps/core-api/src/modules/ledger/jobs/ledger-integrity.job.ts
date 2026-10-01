import { Injectable, Logger, OnApplicationBootstrap } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { BaseHelper } from '@common/libs';
import { TaskHandler, TaskQueueService, TaskRegistry, TaskSchedulerService } from '@common/tasks';

import { LedgerBalanceDriftRepository } from '../repositories/ledger-balance-drift.repository';
import { WalletLedgerDriftRepository } from '../repositories/wallet-ledger-drift.repository';
import { TrialBalanceRepository } from '../repositories/trial-balance.repository';
import { LedgerIntegrityReportDto } from '../dtos/integrity/ledger-integrity-report.dto';
import { LEDGER_INTEGRITY } from '../constants/jobs/ledger-integrity.constant';

@Injectable()
export class LedgerIntegrityJob implements OnApplicationBootstrap, TaskHandler {
  private readonly logger = new Logger(LedgerIntegrityJob.name);
  private readonly intervalMs: number;
  private running = false;

  constructor (
    configService: ConfigService,
    private readonly accountDrift: LedgerBalanceDriftRepository,
    private readonly walletDrift: WalletLedgerDriftRepository,
    private readonly trialBalance: TrialBalanceRepository,
    private readonly registry: TaskRegistry,
    private readonly scheduler: TaskSchedulerService,
    private readonly taskQueue: TaskQueueService
  ) {
    this.intervalMs = configService.get<number>('LEDGER_INTEGRITY_INTERVAL_MS') ?? LEDGER_INTEGRITY.DEFAULT_INTERVAL_MS;
  }

  onApplicationBootstrap (): void {
    this.registry.register({ name: LEDGER_INTEGRITY.TASK_NAME, handler: this });

    this.scheduler.schedule({
      name: LEDGER_INTEGRITY.TASK_NAME,
      everyMs: this.intervalMs,
      run: () => this.taskQueue.enqueue({ name: LEDGER_INTEGRITY.TASK_NAME, dedupeKey: LEDGER_INTEGRITY.TASK_NAME }).then(() => undefined)
    });
  }

  async handle (): Promise<void> {
    await this.tick();
  }

  async check (): Promise<LedgerIntegrityReportDto> {
    const [driftedAccounts, driftedWallets, unbalanced] = await Promise.all([
      this.accountDrift.count(),
      this.walletDrift.count(),
      this.trialBalance.findUnbalanced()
    ]);

    const unbalancedCurrencies = unbalanced.map(({ currency }) => currency);
    const healthy = driftedAccounts === 0 && driftedWallets === 0 && unbalancedCurrencies.length === 0;

    const report = { checkedAt: new Date().toISOString(), driftedAccounts, driftedWallets, unbalancedCurrencies, healthy };
    if (!healthy) this.logger.error(`Ledger integrity check failed: ${JSON.stringify(report)}`);

    return report;
  }

  private async tick (): Promise<void> {
    if (this.running) return;

    this.running = true;

    try {
      await this.check();
    } catch (error) {
      this.logger.warn(`Ledger integrity check skipped: ${BaseHelper.errorResponse({ error }).message}`);
    } finally {
      this.running = false;
    }
  }
}
