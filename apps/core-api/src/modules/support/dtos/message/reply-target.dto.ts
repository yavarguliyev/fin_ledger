import { z } from 'zod';

import { SupportMessageSchema } from './support-message.dto';

export const ReplyTargetSchema = z.object({
  row: SupportMessageSchema,
  target: SupportMessageSchema
});

export type ReplyTargetDto = z.infer<typeof ReplyTargetSchema>;
