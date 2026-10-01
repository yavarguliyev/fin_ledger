import { z } from 'zod';

export const RelyingPartySchema = z.object({
  name: z.string({ message: 'Name must be a string' }),

  id: z.string({ message: 'ID must be a string' }),

  origin: z.string({ message: 'Origin must be a string' })
});

export type RelyingPartyDto = z.infer<typeof RelyingPartySchema>;
