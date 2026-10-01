import { z } from 'zod';

import { BET_STATUSES } from './bet-values.contract';

export const BetContractSchema = z.object({
  id: z.string({ message: 'ID must be a string' }),

  userId: z.string({ message: 'User ID must be a string' }),

  walletId: z.string({ message: 'Wallet ID must be a string' }),

  eventId: z.string({ message: 'Event ID must be a string' }),

  currency: z.string({ message: 'Currency must be a string' }),

  selection: z.string({ message: 'Selection must be a string' }),

  stakeMinor: z.number({ message: 'Stake must be a number' }).int({ message: 'Stake must be an integer' }),

  oddsAtPlacement: z.string({ message: 'Odds must be a string' }),

  potentialPayoutMinor: z.number({ message: 'Potential payout must be a number' }).int({ message: 'Potential payout must be an integer' }),

  status: z.enum(BET_STATUSES, { message: 'Status must be a valid bet status' }),

  payoutMinor: z.number({ message: 'Payout must be a number' }).int({ message: 'Payout must be an integer' }).nullable(),

  drawValue: z.number({ message: 'Draw value must be a number' }).int().nullable(),

  drawThreshold: z.number({ message: 'Draw threshold must be a number' }).int().nullable(),

  idempotencyKey: z.string({ message: 'Idempotency key must be a string' }),

  stakeLedgerTransactionId: z.string({ message: 'Stake ledger transaction ID must be a string' }),

  settlementLedgerTransactionId: z.string({ message: 'Settlement ledger transaction ID must be a string' }).nullable(),

  placedAt: z.string({ message: 'Placed at must be a string' }),

  settledAt: z.string({ message: 'Settled at must be a string' }).nullable(),

  createdAt: z.string({ message: 'Created at must be a string' }),

  updatedAt: z.string({ message: 'Updated at must be a string' })
});

export type BetContract = z.infer<typeof BetContractSchema>;
