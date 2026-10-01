import { z } from 'zod';
import { DatabaseAdapter, SendEmailDto, SendEmailSchema } from '@common/libs';

export const PublishUserEmailSchema = z.object({
  eventPayload: z.custom<SendEmailDto>(() => SendEmailSchema),

  userId: z.string({ message: 'User ID must be a string' }),

  adapter: z.custom<DatabaseAdapter>().optional()
});

export type PublishUserEmailDto = z.infer<typeof PublishUserEmailSchema>;
