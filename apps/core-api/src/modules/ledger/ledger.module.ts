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
    GetTransactionEntriesUseCase
  ],
  exports: [LedgerService, LedgerAccountRepository, CreateLedgerTransactionUseCase]
})
export class LedgerModule {}
