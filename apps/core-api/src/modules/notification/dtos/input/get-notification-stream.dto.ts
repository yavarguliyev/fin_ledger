import { z } from 'zod';

export const GetNotificationStreamSchema = z.object({
  userId: z.string({ message: 'User ID must be a string' })
});

export type GetNotificationStreamDto = z.infer<typeof GetNotificationStreamSchema>;
