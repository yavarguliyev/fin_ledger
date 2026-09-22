import { Module } from '@nestjs/common';

import { LedgerController } from './ledger.controller';
import { LedgerService } from './ledger.service';
import { LedgerAccountRepository } from './repositories/ledger-account.repository';
import { LedgerTransactionRepository } from './repositories/ledger-transaction.repository';
import { LedgerEntryRepository } from './repositories/ledger-entry.repository';
import { CreateLedgerAccountUseCase } from './use-cases/commands/create-ledger-account.use-case';
import { CreateLedgerTransactionUseCase } from './use-cases/commands/create-ledger-transaction.use-case';
import { GetLedgerAccountUseCase } from './use-cases/queries/get-ledger-account.use-case';
import { GetAccountEntriesUseCase } from './use-cases/queries/get-account-entries.use-case';
import { GetTransactionEntriesUseCase } from './use-cases/queries/get-transaction-entries.use-case';
import { SharedModule } from '../../shared/shared.module';
import { GetSystemAccountUseCase } from './use-cases/queries/get-system-account.use-case';
import { LedgerBalanceDriftRepository } from './repositories/ledger-balance-drift.repository';
import { WalletLedgerDriftRepository } from './repositories/wallet-ledger-drift.repository';
import { TrialBalanceRepository } from './repositories/trial-balance.repository';
import { LedgerIntegrityJob } from './jobs/ledger-integrity.job';

@Module({
  imports: [SharedModule],
  controllers: [LedgerController],
  providers: [
    LedgerService,
    LedgerAccountRepository,
    LedgerEntryRepository,
    CreateLedgerAccountUseCase,
    CreateLedgerTransactionUseCase,
    LedgerTransactionRepository,
    GetSystemAccountUseCase,
    GetLedgerAccountUseCase,
    GetAccountEntriesUseCase,
    GetTransactionEntriesUseCase,
    LedgerBalanceDriftRepository,
    WalletLedgerDriftRepository,
    TrialBalanceRepository,
    LedgerIntegrityJob
  ],
  exports: [LedgerService, LedgerAccountRepository, CreateLedgerTransactionUseCase]
})
export class LedgerModule {}
