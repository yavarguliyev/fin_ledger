import { z } from 'zod';

export const MessageHitResponseSchema = z.object({
  id: z.string(),
  senderUserId: z.string().nullable(),
  body: z.string(),
  createdAt: z.coerce.date()
});

export type MessageHitResponseDto = z.infer<typeof MessageHitResponseSchema>;
