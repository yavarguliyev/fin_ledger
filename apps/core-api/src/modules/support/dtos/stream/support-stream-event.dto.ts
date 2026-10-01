import { z } from 'zod';

import { CallSignalSchema } from '../call/call-signal.dto';
import { PresenceEntrySchema } from '../presence/presence-entry.dto';
import { SupportMessageContractSchema } from '@common/contracts';

export const SupportStreamEventSchema = z.object({
  type: z.string({ message: 'Type must be a string' }),

  conversationId: z.string({ message: 'Conversation ID must be a string' }).optional(),

  customerUserId: z.string({ message: 'Customer user ID must be a string' }).optional(),

  assignedStaffId: z.string({ message: 'Assigned staff ID must be a string' }).nullable().optional(),

  presence: PresenceEntrySchema.optional(),

  targetUserId: z.string({ message: 'Target user ID must be a string' }).optional(),

  call: CallSignalSchema.optional(),

  message: SupportMessageContractSchema.optional(),

  readerUserId: z.string({ message: 'Reader user ID must be a string' }).optional()
});

export type SupportStreamEventDto = z.infer<typeof SupportStreamEventSchema>;
