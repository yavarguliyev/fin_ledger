import { z } from 'zod';
import { NotificationSchema } from '../notification/notification.dto';

export const StreamSubjectKeySchema = z.object({
  userId: z.string({ message: 'User ID must be a string' }),

  notification: NotificationSchema
});

export type StreamSubjectKeyDto = z.infer<typeof StreamSubjectKeySchema>;
