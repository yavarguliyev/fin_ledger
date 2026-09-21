import { z } from 'zod';
import { BETTING_TYPES } from '@common/libs';

export const AnalyticsEventPayloadSchema = z.object({
  currency: z.string({ message: 'Currency must be a string' }),

  amountMinor: z.number({ message: 'Amount minor must be a number' }),

  walletId: z.string({ message: 'Wallet ID must be a string' }),

  transactionId: z.string({ message: 'Transaction ID must be a string' }),

  timestamp: z.string({ message: 'Timestamp must be a string' }),

  userId: z.string({ message: 'User ID must be a string' }).optional(),

  reference: z.string({ message: 'Reference must be a string' }).optional(),

  type: z.enum(BETTING_TYPES).optional()
});

export type AnalyticsEventPayloadDto = z.infer<typeof AnalyticsEventPayloadSchema>;
