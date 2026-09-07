import { z } from 'zod';
import { FxProvider } from '@common/libs';

export const FxRateSchema = z.object({
  id: z.string({ message: 'ID must be a string' }),

  provider: z.enum(FxProvider, { message: 'Provider must be a valid FX provider' }),

  rate: z.string({ message: 'Rate must be a string' }),

  baseCurrency: z.string({ message: 'Base currency must be a string' }),

  quoteCurrency: z.string({ message: 'Quote currency must be a string' }),

  quotedAt: z.date({ message: 'Quoted at must be a valid date' }),

  expiresAt: z.date({ message: 'Expires at must be a valid date' }),

  createdAt: z.string({ message: 'Created at must be a string' })
});

export type FxRateDto = z.infer<typeof FxRateSchema>;
