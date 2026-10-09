import { z } from 'zod';

import { ClearChatRequestSchema } from '../request/clear-chat-request.dto';
import { ReadConversationSchema } from '../../../support';

export const ClearChatSchema = ReadConversationSchema.extend(ClearChatRequestSchema.shape);

export type ClearChatDto = z.infer<typeof ClearChatSchema>;
