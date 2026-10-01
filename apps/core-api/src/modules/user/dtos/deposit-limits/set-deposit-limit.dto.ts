import { z } from 'zod';

import { SetDepositLimitRequestSchema } from './set-deposit-limit-request.dto';

export const SetDepositLimitSchema = SetDepositLimitRequestSchema.extend({ userId: z.string({ message: 'User ID must be a string' }) });

export type SetDepositLimitDto = z.infer<typeof SetDepositLimitSchema>;
