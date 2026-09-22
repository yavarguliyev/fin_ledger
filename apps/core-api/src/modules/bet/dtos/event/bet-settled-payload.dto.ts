import { z } from 'zod';
import { BetStatus } from '@common/libs';

export const BetSettledPayloadSchema = z.object({
  betId: z.string(),

  userId: z.string(),

  walletId: z.string(),

  status: z.enum(BetStatus),

  selection: z.string(),

  payoutMinor: z.number().int(),

  currency: z.string()
});

export type BetSettledPayloadDto = z.infer<typeof BetSettledPayloadSchema>;
