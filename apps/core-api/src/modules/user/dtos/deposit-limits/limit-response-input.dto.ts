import { z } from 'zod';

import { DepositLimitSchema } from './deposit-limit.dto';

export const LimitResponseInputSchema = z.object({
  limit: DepositLimitSchema,

  message: z.string({ message: 'Message must be a string' })
});

export type LimitResponseInputDto = z.infer<typeof LimitResponseInputSchema>;
