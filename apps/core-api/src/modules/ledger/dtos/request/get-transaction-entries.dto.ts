import { z } from 'zod';

export const GetTransactionEntriesSchema = z.object({
  id: z.string({ message: 'Transaction ID must be a string' }).min(1, { message: 'Transaction ID is required' })
});

export type GetTransactionEntriesDto = z.infer<typeof GetTransactionEntriesSchema>;
