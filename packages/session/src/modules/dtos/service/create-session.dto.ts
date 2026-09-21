import { z } from 'zod';

import type { SessionData } from '../../interfaces/session-data.interface';

export const CreateSessionSchema = z.object({
  session: z.custom<SessionData>()
});

export type CreateSessionDto = z.infer<typeof CreateSessionSchema>;
