import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { CacheEvict } from '@common/libs';

import { ConvertParamsDto } from '../../dtos/wallet/convert-params.dto';
import { convertMinorAmount } from '../../helpers/conversion/money-conversion.helper';
import { convertWalletTransactions } from '../../helpers/transactions/convert-wallet-transactions.helper';
import { WalletDto } from '../../../wallet/dtos/wallet/wallet.dto';
import { WalletCurrencyBaseUseCase, WalletCurrencyInputWithIds } from '../base/wallet-currency-base.use-case';
import { updateWalletAndLedger } from '../../helpers/wallet/update-wallet-and-ledger.helper';
import { recordConversion } from '../../helpers/records/record-conversion.helper';
import { persistFxRate } from '../../../fx-rate/helpers/persist-fx-rate.helper';

@Injectable()
export class ConvertWalletCurrencyUseCase extends WalletCurrencyBaseUseCase<WalletCurrencyInputWithIds, WalletDto> {
  @CacheEvict({ keyPrefix: ['wallet'], isPattern: true })
  execute (input: WalletCurrencyInputWithIds): Promise<WalletDto> {
    return super.processWalletCurrency(input);
  }

  protected async applyConversion ({ userId, targetCurrency, quote, tx, walletId, ledgerAccountId }: ConvertParamsDto): Promise<WalletDto> {
    if (!walletId) throw new InternalServerErrorException('Wallet ID is required for conversion');

    const source = await this.getSource(walletId, ledgerAccountId, targetCurrency, quote, tx);
    if (source.wallet.currency === targetCurrency) return source.wallet;

    const targetAmountMinor = convertMinorAmount(source.amountMinor, quote.rate);
    const fxRate = await persistFxRate({ quote, tx, fxRateRepository: this.fxRateRepository });
    const rate = quote.rate;

    await convertWalletTransactions({ walletId, rate, targetCurrency, tx, walletTransactionRepository: this.walletTransactionRepository });
    await recordConversion({
      source,
      targetAmountMinor,
      targetCurrency,
      fxRateId: fxRate.id,
      quote,
      tx,
      userId,
      ledgerService: this.ledgerService,
      walletTransactionRepository: this.walletTransactionRepository,
      walletCurrencyConversionRepository: this.walletCurrencyConversionRepository
    });

    return updateWalletAndLedger({
      source,
      targetCurrency,
      targetAmountMinor,
      tx,
      walletRepository: this.walletRepository,
      ledgerAccountRepository: this.ledgerAccountRepository
    });
  }
}
