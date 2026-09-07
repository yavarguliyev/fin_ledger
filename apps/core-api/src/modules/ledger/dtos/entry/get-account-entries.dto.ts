import { z } from 'zod';
import { UserRoles } from '@common/libs';

export const GetAccountEntriesSchema = z.object({
  accountId: z.string({ message: 'Account ID must be a string' }),
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().default(25),
  role: z.nativeEnum(UserRoles).optional()
});

export type GetAccountEntriesDto = z.infer<typeof GetAccountEntriesSchema>;
