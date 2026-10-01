import { z } from 'zod';

export const DepositAllowanceSchema = z.object({
  userId: z.string({ message: 'User ID must be a string' }),

  currency: z.string({ message: 'Currency must be a string' }),

  amountMinor: z.number({ message: 'Amount must be a number' }).int({ message: 'Amount must be an integer' })
});

export type DepositAllowanceDto = z.infer<typeof DepositAllowanceSchema>;
