import { z } from 'zod';
import { DatabaseAdapter, FxProvider } from '@common/libs';

import { FxRateRepository } from '../../repositories/fx-rate.repository';

export const FxQuoteSchema = z.object({
  provider: z.enum(FxProvider, { message: 'Provider must be a valid FX provider' }),

  rate: z.string({ message: 'Rate must be a string' }),

  baseCurrency: z.string({ message: 'Base currency must be a string' }),

  quoteCurrency: z.string({ message: 'Quote currency must be a string' }),

  quotedAt: z.date({ message: 'Quoted at must be a valid date' }),

  expiresAt: z.date({ message: 'Expires at must be a valid date' })
});

export type FxQuoteDto = z.infer<typeof FxQuoteSchema>;
export type FxQuoteInput = { quote: FxQuoteDto; tx: DatabaseAdapter; fxRateRepository: FxRateRepository };
export type PersistFxRatePayload = { id: string };
