import { z } from 'zod';

import { ListMessagesRequestSchema } from '../request/list-messages-request.dto';

export const ListThreadSchema = ListMessagesRequestSchema.extend({
  actorId: z.string({ message: 'Actor ID must be a string' }).min(1, { message: 'Actor ID is required' }),

  role: z.string({ message: 'Role must be a string' })
});

export type ListThreadDto = z.infer<typeof ListThreadSchema>;
