import { forwardRef, Module } from '@nestjs/common';

import { WalletTransactionRepository } from './repositories/wallet-transaction.repository';

import { SharedModule } from '../../shared/shared.module';
import { GetWalletTransactionsUseCase } from './use-cases/queries/get-wallet-transactions.use-case';
import { GetWalletTransactionSummaryUseCase } from './use-cases/queries/get-wallet-transaction-summary.use-case';
import { WalletTransactionService } from './wallet-transaction.service';
import { WalletTransactionController } from './wallet-transaction.controller';
import { AuthModule } from '../auth/auth.module';

@Module({
  imports: [SharedModule, forwardRef(() => AuthModule)],
  controllers: [WalletTransactionController],
  providers: [WalletTransactionService, WalletTransactionRepository, GetWalletTransactionsUseCase, GetWalletTransactionSummaryUseCase],
  exports: [WalletTransactionService, WalletTransactionRepository]
})
export class WalletTransactionModule {}
