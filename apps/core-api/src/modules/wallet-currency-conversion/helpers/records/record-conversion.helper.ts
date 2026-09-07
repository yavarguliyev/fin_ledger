import { WalletConversionContextDto } from '../../../wallet/dtos/conversion/wallet-conversion-context.dto';
import { CurrencyConversionResponseDto, RecorConversion } from '../../dtos/conversion/currency-conversion.response.dto';
import { recordWalletCurrencyConversion } from '../conversion/record-wallet-currency-conversion.helper';
import { createConversionRecord } from './create-conversion-record.helper';

export const recordConversion = async (options: RecorConversion): Promise<CurrencyConversionResponseDto> => {
  const {
    source,
    targetAmountMinor,
    targetCurrency,
    fxRateId,
    quote,
    tx,
    userId,
    ledgerService,
    walletTransactionRepository,
    walletCurrencyConversionRepository
  } = options;

  const context: WalletConversionContextDto = {
    sourceLedgerAccountId: source.ledgerAccount.id,
    targetLedgerAccountId: source.ledgerAccount.id,
    targetCurrency,
    sourceAmountMinor: source.amountMinor,
    targetAmountMinor
  };

  const conversion = await createConversionRecord({ walletCurrencyConversionRepository, source, context, fxRateId, quote, tx, userId });
  const dto = { ...context, sourceWallet: source.wallet, targetWallet: source.wallet, conversion, tx };

  await recordWalletCurrencyConversion({ dto, ledgerService, walletTransactionRepository });
  return conversion;
};
