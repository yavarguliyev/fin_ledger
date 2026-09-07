import { InternalServerErrorException } from '@nestjs/common';
import { WalletTransactionStatus } from '@common/libs';

import { CurrencyConversionRequest, CurrencyConversionResponseDto } from '../../dtos/conversion/currency-conversion.response.dto';

export const createConversionRecord = async (options: CurrencyConversionRequest): Promise<CurrencyConversionResponseDto> => {
  const { walletCurrencyConversionRepository, source, context, fxRateId, quote, tx, userId } = options;

  const conversion = await walletCurrencyConversionRepository.createConversion(
    {
      ...context,
      userId,
      sourceWalletId: source.wallet.id,
      targetWalletId: source.wallet.id,
      sourceCurrency: source.wallet.currency,
      feeAmountMinor: 0,
      feeCurrency: context.targetCurrency,
      fxRateId,
      rate: quote.rate,
      rateProvider: quote.provider,
      idempotencyKey: fxRateId,
      status: WalletTransactionStatus.COMPLETED
    },
    tx
  );

  if (!conversion) throw new InternalServerErrorException('Failed to record wallet currency conversion');
  return conversion;
};
