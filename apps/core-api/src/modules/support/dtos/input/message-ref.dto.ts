import { z } from 'zod';

export const MessageRefSchema = z.object({ messageId: z.string({ message: 'Message ID must be a string' }) });

export type MessageRefDto = z.infer<typeof MessageRefSchema>;
