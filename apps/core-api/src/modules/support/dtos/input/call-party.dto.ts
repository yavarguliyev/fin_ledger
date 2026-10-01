import { z } from 'zod';

export const CallPartySchema = z.object({
  callId: z.string({ message: 'Call ID must be a string' }),

  userId: z.string({ message: 'User ID must be a string' }).min(1, { message: 'User ID is required' })
});

export type CallPartyDto = z.infer<typeof CallPartySchema>;
