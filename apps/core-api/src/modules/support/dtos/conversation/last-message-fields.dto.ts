import { SupportConversationContractSchema } from '@common/contracts';
import { z } from 'zod';

export const LastMessageFieldsSchema = SupportConversationContractSchema.pick({
  lastMessagePreview: true,
  lastMessageSenderId: true,
  lastMessageKind: true,
  lastMessageSeen: true,
  lastMessageDeleted: true
});

export type LastMessageFieldsDto = z.infer<typeof LastMessageFieldsSchema>;
