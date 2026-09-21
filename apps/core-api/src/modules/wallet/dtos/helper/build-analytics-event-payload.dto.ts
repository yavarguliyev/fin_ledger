import { z } from 'zod';
import { BETTING_TYPES } from '@common/libs';

export const BuildAnalyticsEventPayloadSchema = z.object({
  walletId: z.string({ message: 'Wallet ID must be a string' }).min(1, { message: 'Wallet ID is required' }),

  amountMinor: z.number({ message: 'Amount must be a number' }).int({ message: 'Amount must be an integer' }),

  currency: z.string({ message: 'Currency must be a string' }),

  transactionId: z.string({ message: 'Transaction ID must be a string' }),

  reference: z.string({ message: 'Reference must be a string' }).optional(),

  currentBettingType: z.enum(BETTING_TYPES, { message: 'Betting type must be a valid betting type' })
});

export type BuildAnalyticsEventPayloadDto = z.infer<typeof BuildAnalyticsEventPayloadSchema>;
