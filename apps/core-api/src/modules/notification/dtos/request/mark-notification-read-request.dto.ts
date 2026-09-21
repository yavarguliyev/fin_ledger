import { z } from 'zod';

export const MarkNotificationReadRequestSchema = z.object({
  id: z.string({ message: 'Notification ID must be a string' }).min(1, { message: 'Notification ID is required' })
});

export type MarkNotificationReadRequestDto = z.infer<typeof MarkNotificationReadRequestSchema>;
