import { z } from 'zod';

export const GetLedgerAccountSchema = z.object({
  id: z.string({ message: 'Account ID must be a string' }).min(1, { message: 'Account ID is required' })
});

export type GetLedgerAccountDto = z.infer<typeof GetLedgerAccountSchema>;
