import { z } from 'zod';

export const ListPresenceSchema = z.object({
  actorId: z.string({ message: 'Actor ID must be a string' }).min(1, { message: 'Actor ID is required' }),

  role: z.string({ message: 'Role must be a string' })
});

export type ListPresenceDto = z.infer<typeof ListPresenceSchema>;
