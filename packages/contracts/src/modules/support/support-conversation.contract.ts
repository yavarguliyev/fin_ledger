import { z } from 'zod';

import { SUPPORT_CONVERSATION_STATUSES } from './support-values.contract';

export const SupportConversationContractSchema = z.object({
  id: z.string({ message: 'ID must be a string' }),

  customerUserId: z.string({ message: 'Customer user ID must be a string' }),

  customerName: z.string({ message: 'Customer name must be a string' }).nullable(),

  assignedStaffId: z.string({ message: 'Assigned staff ID must be a string' }).nullable(),

  assignedStaffName: z.string({ message: 'Assigned staff name must be a string' }).nullable(),

  subject: z.string({ message: 'Subject must be a string' }).nullable(),

  status: z.enum(SUPPORT_CONVERSATION_STATUSES, { message: 'Status must be a valid support conversation status' }),

  unreadCount: z.number({ message: 'Unread count must be a number' }),

  lastMessagePreview: z.string({ message: 'Last message preview must be a string' }).nullable(),

  lastMessageAt: z.string({ message: 'Last message at must be a string' }),

  createdAt: z.string({ message: 'Created at must be a string' })
});

export type SupportConversationContract = z.infer<typeof SupportConversationContractSchema>;
