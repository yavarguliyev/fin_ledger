import { z } from 'zod';

export const PasskeyLoginOptionsSchema = z.object({
  owner: z.string({ message: 'Owner must be a string' }).min(1, { message: 'Owner is required' })
});

export type PasskeyLoginOptionsDto = z.infer<typeof PasskeyLoginOptionsSchema>;
