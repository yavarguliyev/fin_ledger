import { z } from 'zod';
import { DatabaseAdapter } from '@common/libs';

export const CreateBetSchema = z.object({
  userId: z.string({ message: 'User ID must be a string' }),

  walletId: z.string({ message: 'Wallet ID must be a string' }),

  eventId: z.string({ message: 'Event ID must be a string' }),

  currency: z.string({ message: 'Currency must be a string' }),

  selection: z.string({ message: 'Selection must be a string' }),

  stakeMinor: z.number({ message: 'Stake must be a number' }).int({ message: 'Stake must be an integer' }),

  oddsAtPlacement: z.string({ message: 'Odds must be a string' }),

  potentialPayoutMinor: z.number({ message: 'Potential payout must be a number' }).int({ message: 'Potential payout must be an integer' }),

  idempotencyKey: z.string({ message: 'Idempotency key must be a string' }),

  stakeLedgerTransactionId: z.string({ message: 'Stake ledger transaction ID must be a string' }),

  adapter: z.custom<DatabaseAdapter>().optional()
});

export type CreateBetDto = z.infer<typeof CreateBetSchema>;
