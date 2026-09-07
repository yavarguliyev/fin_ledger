import { InternalServerErrorException } from '@nestjs/common';

import { FxQuoteInput, PersistFxRatePayload } from '../dtos/quote/fx-quote.dto';

export const persistFxRate = async ({ quote, tx, fxRateRepository }: FxQuoteInput): Promise<PersistFxRatePayload> => {
  const fxRate = await fxRateRepository.createRate(quote, tx);
  if (!fxRate) throw new InternalServerErrorException('Failed to persist FX quote');
  return fxRate;
};
