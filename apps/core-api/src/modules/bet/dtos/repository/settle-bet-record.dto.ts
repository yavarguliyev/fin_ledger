import { z } from 'zod';
import { DatabaseAdapter } from '@common/libs';

import { BetOutcomeSchema } from '../bet/bet-outcome.dto';

export const SettleBetRecordSchema = BetOutcomeSchema.extend({
  betId: z.string({ message: 'Bet ID must be a string' }),

  settledAt: z.string({ message: 'Settled at must be a string' }),

  settlementLedgerTransactionId: z.string({ message: 'Settlement ledger transaction ID must be a string' }).optional(),

  adapter: z.custom<DatabaseAdapter>().optional()
});

export type SettleBetRecordDto = z.infer<typeof SettleBetRecordSchema>;
