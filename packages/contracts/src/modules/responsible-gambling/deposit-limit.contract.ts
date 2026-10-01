import { z } from 'zod';

import { DEPOSIT_LIMIT_PERIODS } from './deposit-limit-values.contract';

export const DepositLimitContractSchema = z.object({
  period: z.enum(DEPOSIT_LIMIT_PERIODS, { message: 'Period must be DAILY, WEEKLY or MONTHLY' }),

  currency: z.string({ message: 'Currency must be a string' }),

  amountMinor: z.number({ message: 'Amount must be a number' }).int({ message: 'Amount must be an integer' }),

  pendingAmountMinor: z.number({ message: 'Pending amount must be a number' }).int({ message: 'Pending amount must be an integer' }).nullable(),

  pendingEffectiveAt: z.string({ message: 'Pending effective at must be a string' }).nullable()
});

export type DepositLimitContract = z.infer<typeof DepositLimitContractSchema>;
