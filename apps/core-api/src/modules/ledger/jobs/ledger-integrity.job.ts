import { Injectable, Logger, OnApplicationBootstrap, OnModuleDestroy } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { BaseHelper, RequestScope } from '@common/libs';

import { LedgerBalanceDriftRepository } from '../repositories/ledger-balance-drift.repository';
import { WalletLedgerDriftRepository } from '../repositories/wallet-ledger-drift.repository';
import { TrialBalanceRepository } from '../repositories/trial-balance.repository';
import { LedgerIntegrityReportDto } from '../dtos/integrity/ledger-integrity-report.dto';
import { LEDGER_INTEGRITY } from '../constants/jobs/ledger-integrity.constant';

@Injectable()
export class LedgerIntegrityJob implements OnApplicationBootstrap, OnModuleDestroy {
  private readonly logger = new Logger(LedgerIntegrityJob.name);
  private readonly intervalMs: number;
  private intervalHandle: ReturnType<typeof setInterval> | null = null;
  private running = false;

  constructor (
    configService: ConfigService,
    private readonly accountDrift: LedgerBalanceDriftRepository,
    private readonly walletDrift: WalletLedgerDriftRepository,
    private readonly trialBalance: TrialBalanceRepository
  ) {
    this.intervalMs = configService.get<number>('LEDGER_INTEGRITY_INTERVAL_MS') ?? LEDGER_INTEGRITY.DEFAULT_INTERVAL_MS;
  }

  onApplicationBootstrap (): void {
    this.intervalHandle = setInterval(() => void RequestScope.runSystem(() => this.tick()), this.intervalMs);
    this.intervalHandle.unref();
  }

  onModuleDestroy (): void {
    if (this.intervalHandle) clearInterval(this.intervalHandle);
    this.intervalHandle = null;
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
