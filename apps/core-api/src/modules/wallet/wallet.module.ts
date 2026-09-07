import { Module } from '@nestjs/common';

import { WalletController } from './wallet.controller';
import { WalletService } from './wallet.service';
import { WalletRepository } from './repositories/wallet.repository';
import { CreateWalletUseCase } from './use-cases/commands/wallet/create-wallet.use-case';
import { GetWalletUseCase } from './use-cases/queries/get-wallet.use-case';
import { GetWalletByUserIdUseCase } from './use-cases/queries/get-wallet-by-user-id.use-case';
import { CreditWalletUseCase } from './use-cases/commands/wallet/credit-wallet.use-case';
import { DebitWalletUseCase } from './use-cases/commands/wallet/debit-wallet.use-case';
import { ReserveFundsUseCase } from './use-cases/commands/funds/reserve-funds.use-case';
import { ReleaseFundsUseCase } from './use-cases/commands/funds/release-funds.use-case';
import { PlaceBetUseCase } from './use-cases/commands/wallet/place-bet.use-case';
import { SettleWinningsUseCase } from './use-cases/commands/wallet/settle-winnings.use-case';
import { UpdateWalletStatusUseCase } from './use-cases/commands/wallet/update-wallet-status.use-case';
import { SharedModule } from '../../shared/shared.module';
import { LedgerModule } from '../ledger/ledger.module';
import { WalletTransactionModule } from '../wallet-transactions/wallet-transaction.module';
import { NotificationModule } from '../notification/notification.module';

@Module({
  imports: [SharedModule, LedgerModule, WalletTransactionModule, NotificationModule],
  controllers: [WalletController],
  providers: [
    WalletService,
    WalletRepository,
    CreateWalletUseCase,
    GetWalletUseCase,
    GetWalletByUserIdUseCase,
    CreditWalletUseCase,
    DebitWalletUseCase,
    ReserveFundsUseCase,
    ReleaseFundsUseCase,
    PlaceBetUseCase,
    SettleWinningsUseCase,
    UpdateWalletStatusUseCase
  ],
  exports: [WalletService, WalletRepository]
})
export class WalletModule {}
