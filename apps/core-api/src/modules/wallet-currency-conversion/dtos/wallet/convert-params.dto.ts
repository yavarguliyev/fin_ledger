import { z } from 'zod';
import { DatabaseAdapter } from '@common/libs';

import { FxQuoteSchema } from '../../../fx-rate/dtos/quote/fx-quote.dto';

export const ConvertParamsSchema = z.object({
  userId: z.string({ message: 'User ID must be a string' }),

  targetCurrency: z.string({ message: 'Target currency must be a string' }),

  quote: FxQuoteSchema,

  walletId: z.string({ message: 'Wallet ID must be a string' }).optional(),

  ledgerAccountId: z.string({ message: 'Ledger Account ID must be a string' }).optional()
});

export type ConvertParamsDto = z.infer<typeof ConvertParamsSchema> & { tx: DatabaseAdapter };
