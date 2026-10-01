import { z } from 'zod';
import { BET_STATUSES } from '@common/contracts';

export const BetSettledPayloadSchema = z.object({
  betId: z.string(),

  userId: z.string(),

  walletId: z.string(),

  status: z.enum(BET_STATUSES),

  selection: z.string(),

  payoutMinor: z.number().int(),

  currency: z.string()
});

export type BetSettledPayloadDto = z.infer<typeof BetSettledPayloadSchema>;
