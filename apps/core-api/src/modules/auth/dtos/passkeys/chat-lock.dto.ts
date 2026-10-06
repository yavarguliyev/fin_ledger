import { z } from 'zod';

import { ChatLockRequestSchema } from './chat-lock-request.dto';

export const ChatLockSchema = ChatLockRequestSchema.extend({
  userId: z.string({ message: 'User ID must be a string' }).min(1),

  role: z.string({ message: 'Role must be a string' })
});

export type ChatLockDto = z.infer<typeof ChatLockSchema>;
