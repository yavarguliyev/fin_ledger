import { z } from 'zod';

import { DepositLimitSchema } from './deposit-limit.dto';

export const DepositLimitRefSchema = z.object({
  limit: DepositLimitSchema
});

export type DepositLimitRefDto = z.infer<typeof DepositLimitRefSchema>;
