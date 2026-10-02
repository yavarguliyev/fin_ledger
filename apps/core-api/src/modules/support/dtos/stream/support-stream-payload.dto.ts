import { z } from 'zod';

import { PresenceContractSchema, SupportMessageContractSchema } from '@common/contracts';

import { CallSignalSchema } from '../call/call-signal.dto';

export const SupportStreamPayloadSchema = z.object({
  type: z.string({ message: 'Type must be a string' }),

  conversationId: z.string({ message: 'Conversation ID must be a string' }).optional(),

  presence: PresenceContractSchema.optional(),

  call: CallSignalSchema.optional(),

  message: SupportMessageContractSchema.optional(),

  readerUserId: z.string({ message: 'Reader user ID must be a string' }).optional(),

  typingUserId: z.string({ message: 'Typing user ID must be a string' }).optional()
});

export type SupportStreamPayloadDto = z.infer<typeof SupportStreamPayloadSchema>;
