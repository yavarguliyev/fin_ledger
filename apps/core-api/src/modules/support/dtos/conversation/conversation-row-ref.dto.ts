import { z } from 'zod';

import { SupportConversationSchema } from './support-conversation.dto';

export const ConversationRowRefSchema = z.object({ row: SupportConversationSchema });

export type ConversationRowRefDto = z.infer<typeof ConversationRowRefSchema>;
