import { z } from 'zod';

import { DepositLimitSchema } from './deposit-limit.dto';

export const DepositLimitResponseSchema = z.object({
  message: z.string({ message: 'Message must be a string' }),

  limit: DepositLimitSchema.omit({ id: true, userId: true, createdAt: true, updatedAt: true })
});

export type DepositLimitResponseDto = z.infer<typeof DepositLimitResponseSchema>;
