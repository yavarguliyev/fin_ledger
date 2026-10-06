import { Module } from '@nestjs/common';

import { SharedModule } from '../../shared/shared.module';
import { GetWalletTransactionsUseCase } from './use-cases/queries/get-wallet-transactions.use-case';
import { GetWalletTransactionSummaryUseCase } from './use-cases/queries/get-wallet-transaction-summary.use-case';
import { GetWalletOverviewUseCase } from './use-cases/queries/get-wallet-overview.use-case';
import { WalletTransactionService } from './wallet-transaction.service';
import { WalletTransactionController } from './wallet-transaction.controller';
import { WalletModule } from '../wallet/wallet.module';

@Module({
  imports: [SharedModule, WalletModule],
  controllers: [WalletTransactionController],
  providers: [WalletTransactionService, GetWalletTransactionsUseCase, GetWalletTransactionSummaryUseCase, GetWalletOverviewUseCase],
  exports: [WalletTransactionService]
})
export class WalletTransactionModule {}
