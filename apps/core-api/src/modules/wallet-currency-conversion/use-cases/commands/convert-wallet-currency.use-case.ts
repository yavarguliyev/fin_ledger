import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { CacheEvict } from '@common/libs';

import { ConvertParamsDto } from '../../dtos/wallet/convert-params.dto';
import { WalletCurrencyInputWithIds, WalletDto } from '../../../wallet/dtos/wallet/wallet.dto';
import { WalletCurrencyBaseUseCase } from '../base/wallet-currency-base.use-case';
import { FxRateHelper } from '../../../fx-rate/helpers/fx-rate.helper';
import { WalletConversionHelper } from '../../helpers/wallet-conversion.helper';
import { WalletConversionTransactionHelper } from '../../helpers/wallet-conversion-transaction.helper';

@Injectable()
export class ConvertWalletCurrencyUseCase extends WalletCurrencyBaseUseCase<WalletCurrencyInputWithIds, WalletDto> {
  @CacheEvict({ keyPrefix: ['wallet'], isPattern: true })
  execute (input: WalletCurrencyInputWithIds): Promise<WalletDto> {
    return super.processWalletCurrency(input);
  }

  protected async applyConversion ({ userId, targetCurrency, quote, tx, walletId, ledgerAccountId }: ConvertParamsDto): Promise<WalletDto> {
    if (!walletId) throw new InternalServerErrorException('Wallet ID is required for conversion');

    const source = await this.getSource({ walletId, ledgerAccountId, targetCurrency, quote, tx });
    if (source.wallet.currency === targetCurrency) return source.wallet;

    const targetAmountMinor = WalletConversionHelper.convertMinorAmount(source.amountMinor, quote.rate);
    const fxRate = await FxRateHelper.persistFxRate({ quote, tx, fxRateRepository: this.fxRateRepository });
    const rate = quote.rate;

    await WalletConversionTransactionHelper.convertWalletTransactions({
      walletId,
      rate,
      targetCurrency,
      tx,
      walletTransactionRepository: this.walletTransactionRepository
    });

    await WalletConversionHelper.recordConversion({
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

    return WalletConversionHelper.updateWalletAndLedger({
      source,
      targetCurrency,
      targetAmountMinor,
      tx,
      walletRepository: this.walletRepository,
      ledgerAccountRepository: this.ledgerAccountRepository
    });
  }
}
