import { z } from 'zod';
import { SUPPORT_CONVERSATION_STATUSES } from '@common/contracts';

export const SupportConversationSchema = z.object({
  id: z.string({ message: 'ID must be a string' }),
  customerUserId: z.string({ message: 'Customer user ID must be a string' }),
  customerName: z.string({ message: 'Customer name must be a string' }).nullable().optional(),
  assignedStaffId: z.string({ message: 'Assigned staff ID must be a string' }).nullable(),
  assignedStaffName: z.string({ message: 'Assigned staff name must be a string' }).nullable().optional(),
  subject: z.string({ message: 'Subject must be a string' }).nullable(),
  status: z.enum(SUPPORT_CONVERSATION_STATUSES, { message: 'Status must be a valid conversation status' }),
  unreadCount: z.number({ message: 'Unread count must be a number' }).optional(),
  lastMessagePreview: z.string({ message: 'Last message preview must be a string' }).nullable().optional(),
  lastMessageAt: z.string({ message: 'Last message at must be a string' }),
  createdAt: z.string({ message: 'Created at must be a string' })
});

export type SupportConversationDto = z.infer<typeof SupportConversationSchema>;
