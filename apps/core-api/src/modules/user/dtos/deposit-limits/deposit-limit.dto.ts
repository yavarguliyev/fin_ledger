import { z } from 'zod';
import { DepositLimitContractSchema } from '@common/contracts';

export const DepositLimitSchema = DepositLimitContractSchema.extend({
  id: z.string({ message: 'ID must be a string' }),

  userId: z.string({ message: 'User ID must be a string' }),

  createdAt: z.string({ message: 'Created at must be a string' }),

  updatedAt: z.string({ message: 'Updated at must be a string' })
});

export type DepositLimitDto = z.infer<typeof DepositLimitSchema>;
