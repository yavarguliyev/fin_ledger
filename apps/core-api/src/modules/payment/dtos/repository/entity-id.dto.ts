import { z } from 'zod';

export const EntityIdSchema = z.object({
  id: z.string({ message: 'ID must be a string' })
});

export type EntityIdDto = z.infer<typeof EntityIdSchema>;
