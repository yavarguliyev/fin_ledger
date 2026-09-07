import { z } from 'zod';

import { FLOW_DIRECTIONS } from '@common/libs';

export const LedgerEntryParamsSchema = z.object({
  direction: z.enum(FLOW_DIRECTIONS, { message: 'Direction must be a valid flow direction' }),

  ledgerAccountId: z.string({ message: 'Ledger account ID must be a string' }),

  reference: z.string({ message: 'Reference must be a string' }),

  descriptionPrefix: z.string({ message: 'Description prefix must be a string' }),

  systemAccountId: z.string({ message: 'System account ID must be a string' }),

  currency: z.string({ message: 'Currency must be a string' }),

  amountMinor: z.number({ message: 'Amount must be a number' }).int({ message: 'Amount must be an integer' })
});

export type LedgerEntryParamsDto = z.infer<typeof LedgerEntryParamsSchema>;
