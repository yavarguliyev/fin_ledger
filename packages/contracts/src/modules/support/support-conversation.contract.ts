import { z } from 'zod';

import { SUPPORT_CHAT_THEMES, SUPPORT_CONVERSATION_STATUSES, SUPPORT_MESSAGE_KINDS } from './support-values.contract';

export const SupportConversationContractSchema = z.object({
  id: z.string({ message: 'ID must be a string' }),

  customerUserId: z.string({ message: 'Customer user ID must be a string' }),

  customerName: z.string({ message: 'Customer name must be a string' }).nullable(),

  assignedStaffId: z.string({ message: 'Assigned staff ID must be a string' }).nullable(),

  assignedStaffName: z.string({ message: 'Assigned staff name must be a string' }).nullable(),

  customerAvatarUrl: z.string({ message: 'Customer avatar URL must be a string' }).nullable().optional(),

  assignedStaffAvatarUrl: z.string({ message: 'Staff avatar URL must be a string' }).nullable().optional(),

  subject: z.string({ message: 'Subject must be a string' }).nullable(),

  status: z.enum(SUPPORT_CONVERSATION_STATUSES, { message: 'Status must be a valid support conversation status' }),

  unreadCount: z.number({ message: 'Unread count must be a number' }),

  lastMessagePreview: z.string({ message: 'Last message preview must be a string' }).nullable(),

  lastMessageSenderId: z.string({ message: 'Last message sender ID must be a string' }).nullable(),

  lastMessageKind: z.enum(SUPPORT_MESSAGE_KINDS, { message: 'Last message kind must be a valid message kind' }).nullable(),

  lastMessageSeen: z.boolean({ message: 'Last message seen must be a boolean' }),

  lastMessageDeleted: z.boolean({ message: 'Last message deleted must be a boolean' }),

  privacyEnabled: z.boolean({ message: 'Privacy enabled must be a boolean' }),

  locked: z.boolean({ message: 'Locked must be a boolean' }),

  muted: z.boolean({ message: 'Muted must be a boolean' }),

  mutedUntil: z.string({ message: 'Muted until must be a string' }).nullable(),

  pinnedAt: z.string({ message: 'Pinned at must be a string' }).nullable(),

  favourite: z.boolean({ message: 'Favourite must be a boolean' }),

  theme: z.enum(SUPPORT_CHAT_THEMES, { message: 'Theme must be a valid chat theme' }).nullable(),

  lastMessageAt: z.string({ message: 'Last message at must be a string' }),

  createdAt: z.string({ message: 'Created at must be a string' })
});

export type SupportConversationContract = z.infer<typeof SupportConversationContractSchema>;
