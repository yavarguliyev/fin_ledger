import { z } from 'zod';

export const LastSeenResponseSchema = z.object({
  userId: z.string({ message: 'User ID must be a string' }),

  lastSeenAt: z.string({ message: 'Last seen at must be a string' }).nullable()
});

export type LastSeenResponseDto = z.infer<typeof LastSeenResponseSchema>;
