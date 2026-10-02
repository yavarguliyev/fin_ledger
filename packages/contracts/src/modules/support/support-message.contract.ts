import { z } from 'zod';

import { SUPPORT_MESSAGE_KINDS, SUPPORT_MESSAGE_SOURCES } from './support-values.contract';

export const SupportAttachmentContractSchema = z.object({
  url: z.string({ message: 'URL must be a string' }),

  fileName: z.string({ message: 'File name must be a string' }).nullable(),

  mimeType: z.string({ message: 'Mime type must be a string' }),

  sizeBytes: z.number({ message: 'Size bytes must be a number' }),

  durationSeconds: z.number({ message: 'Duration seconds must be a number' }).nullable()
});

export type SupportAttachmentContract = z.infer<typeof SupportAttachmentContractSchema>;

export const SupportReplyContractSchema = z.object({
  id: z.string({ message: 'Reply ID must be a string' }),

  senderUserId: z.string({ message: 'Reply sender must be a string' }).nullable(),

  senderName: z.string({ message: 'Reply sender name must be a string' }).nullable(),

  body: z.string({ message: 'Reply body must be a string' }).nullable(),

  kind: z.enum(SUPPORT_MESSAGE_KINDS, { message: 'Reply kind must be a valid support message kind' }),

  deleted: z.boolean({ message: 'Reply deleted must be a boolean' })
});

export type SupportReplyContract = z.infer<typeof SupportReplyContractSchema>;

export const SupportMessageContractSchema = z.object({
  id: z.string({ message: 'ID must be a string' }),

  conversationId: z.string({ message: 'Conversation ID must be a string' }),

  senderUserId: z.string({ message: 'Sender user ID must be a string' }).nullable(),

  senderName: z.string({ message: 'Sender name must be a string' }).nullable(),

  senderIsStaff: z.boolean({ message: 'Sender is staff must be a boolean' }),

  kind: z.enum(SUPPORT_MESSAGE_KINDS, { message: 'Kind must be a valid support message kind' }),

  source: z.enum(SUPPORT_MESSAGE_SOURCES, { message: 'Source must be a valid support message source' }),

  body: z.string({ message: 'Body must be a string' }).nullable(),

  attachment: SupportAttachmentContractSchema.nullable(),

  replyTo: SupportReplyContractSchema.nullable().optional(),

  editedAt: z.string({ message: 'Edited at must be a string' }).nullable(),

  deletedAt: z.string({ message: 'Deleted at must be a string' }).nullable(),

  seen: z.boolean({ message: 'Seen must be a boolean' }).optional(),

  createdAt: z.string({ message: 'Created at must be a string' })
});

export type SupportMessageContract = z.infer<typeof SupportMessageContractSchema>;
