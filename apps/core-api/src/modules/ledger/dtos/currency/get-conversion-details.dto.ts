import { z } from 'zod';
import { FLOW_DIRECTIONS } from '@common/libs';

import { CurrencyLedgerSchema } from './currency-ledger.dto';

export const GetConversionDetailsParamsSchema = z.object({
  direction: z.enum(FLOW_DIRECTIONS, { message: 'Direction must be a valid flow direction' }),

  dto: CurrencyLedgerSchema
});

export type GetConversionDetailsParamsDto = z.infer<typeof GetConversionDetailsParamsSchema>;
