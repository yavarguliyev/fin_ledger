import { z } from 'zod';
import { DEPOSIT_LIMIT_PERIODS } from '@common/contracts';

export const SetDepositLimitRequestSchema = z.object({
  period: z.enum(DEPOSIT_LIMIT_PERIODS, { message: 'Period must be DAILY, WEEKLY or MONTHLY' }),

  currency: z.string({ message: 'Currency must be a string' }).length(3, { message: 'Currency must be a three letter code' }),

  amountMinor: z
    .number({ message: 'Amount must be a number' })
    .int({ message: 'Amount must be an integer' })
    .positive({ message: 'Amount must be positive' })
});

export type SetDepositLimitRequestDto = z.infer<typeof SetDepositLimitRequestSchema>;
