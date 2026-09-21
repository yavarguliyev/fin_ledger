import { z } from 'zod';

import { MarkNotificationReadRequestSchema } from '../request/mark-notification-read-request.dto';

export const MarkNotificationReadSchema = MarkNotificationReadRequestSchema.extend({
  userId: z.string({ message: 'User ID must be a string' })
});

export type MarkNotificationReadDto = z.infer<typeof MarkNotificationReadSchema>;
