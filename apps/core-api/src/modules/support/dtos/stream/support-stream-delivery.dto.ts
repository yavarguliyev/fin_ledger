import { z } from 'zod';

import { SupportStreamEventSchema } from './support-stream-event.dto';

export const SupportStreamDeliverySchema = z.object({
  event: SupportStreamEventSchema,

  userId: z.string({ message: 'User ID must be a string' }),

  role: z.string({ message: 'Role must be a string' })
});

export type SupportStreamDeliveryDto = z.infer<typeof SupportStreamDeliverySchema>;
