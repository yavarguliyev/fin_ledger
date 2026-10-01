import { z } from 'zod';
import { DEPOSIT_LIMIT_PERIODS } from '@common/contracts';

export const SpentInPeriodSchema = z.object({
  userId: z.string({ message: 'User ID must be a string' }),

  currency: z.string({ message: 'Currency must be a string' }),

  period: z.enum(DEPOSIT_LIMIT_PERIODS, { message: 'Period must be DAILY, WEEKLY or MONTHLY' })
});

export type SpentInPeriodDto = z.infer<typeof SpentInPeriodSchema>;
