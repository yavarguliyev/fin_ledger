import { z } from 'zod';

export const SetupSessionResultSchema = z.object({
  url: z.string({ message: 'URL must be a string' }),

  sessionId: z.string({ message: 'Session ID must be a string' })
});

export type SetupSessionResultDto = z.infer<typeof SetupSessionResultSchema>;
