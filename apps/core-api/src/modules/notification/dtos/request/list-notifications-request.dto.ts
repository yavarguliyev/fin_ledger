import { z } from 'zod';

export const ListNotificationsRequestSchema = z.object({
  limit: z.coerce.number({ message: 'Limit must be a number' }).int().positive().default(50)
});

export type ListNotificationsRequestDto = z.infer<typeof ListNotificationsRequestSchema>;
