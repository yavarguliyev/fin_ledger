import { z } from 'zod';
import { DatabaseAdapter } from '@common/libs';

export const GetCreateSystemAccountSchema = z.object({
  currency: z
    .string({ message: 'Currency must be a string' })
    .min(1, { message: 'Currency is required' })
    .length(3, { message: 'Currency must be a 3-character ISO code' })
});

export type GetCreateSystemAccountDto = z.infer<typeof GetCreateSystemAccountSchema> & { adapter?: DatabaseAdapter | undefined };
