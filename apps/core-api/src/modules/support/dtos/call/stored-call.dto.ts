import { z } from 'zod';
import { SupportCallMedia, SupportCallStatus } from '@common/libs';

export const StoredCallSchema = z.object({
  callId: z.string({ message: 'Call ID must be a string' }),

  conversationId: z.string({ message: 'Conversation ID must be a string' }),

  callerId: z.string({ message: 'Caller ID must be a string' }),

  callerName: z.string({ message: 'Caller name must be a string' }),

  callerRole: z.string({ message: 'Caller role must be a string' }),

  calleeId: z.string({ message: 'Callee ID must be a string' }),

  media: z.enum(SupportCallMedia),

  status: z.enum(SupportCallStatus),

  startedAt: z.string({ message: 'Started at must be a string' }),

  answeredAt: z.string({ message: 'Answered at must be a string' }).nullable()
});

export type StoredCallDto = z.infer<typeof StoredCallSchema>;
