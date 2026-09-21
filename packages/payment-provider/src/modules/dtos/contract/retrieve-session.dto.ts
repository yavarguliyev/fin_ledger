import { z } from 'zod';

export const RetrieveSessionSchema = z.object({
  sessionId: z.string({ message: 'Session ID must be a string' })
});

export type RetrieveSessionDto = z.infer<typeof RetrieveSessionSchema>;
