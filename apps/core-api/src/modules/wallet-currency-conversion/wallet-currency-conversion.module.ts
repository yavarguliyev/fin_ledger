import { Module } from '@nestjs/common';

import { SharedModule } from '../../shared/shared.module';
import { WalletCurrencyConversionRepository } from './repositories/wallet-currency-conversion.repository';
import { ConvertWalletCurrencyUseCase } from './use-cases/commands/convert-wallet-currency.use-case';
import { WalletModule } from '../wallet/wallet.module';
import { LedgerModule } from '../ledger/ledger.module';
import { FxModule } from '../fx-rate/fx.module';
import { WalletTransactionModule } from '../wallet-transactions/wallet-transaction.module';

@Module({
  imports: [SharedModule, WalletModule, LedgerModule, FxModule, WalletTransactionModule],
  providers: [WalletCurrencyConversionRepository, ConvertWalletCurrencyUseCase],
  exports: [WalletCurrencyConversionRepository, ConvertWalletCurrencyUseCase]
})
export class WalletCurrencyConversionModule {}
