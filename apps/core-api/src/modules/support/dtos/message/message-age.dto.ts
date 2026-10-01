import { z } from 'zod';

import { SupportMessageSchema } from './support-message.dto';

export const MessageAgeSchema = z.object({
  message: SupportMessageSchema,

  windowMs: z.number({ message: 'Window must be a number' }).int().positive()
});

export type MessageAgeDto = z.infer<typeof MessageAgeSchema>;
