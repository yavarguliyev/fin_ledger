import { z } from 'zod';

import { DeleteMessagesRequestSchema } from '../request/delete-messages-request.dto';
import { ReadConversationSchema } from '../../../support';

export const DeleteMessagesSchema = ReadConversationSchema.extend(DeleteMessagesRequestSchema.shape);

export type DeleteMessagesDto = z.infer<typeof DeleteMessagesSchema>;
