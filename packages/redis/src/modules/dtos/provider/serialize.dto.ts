import { z } from 'zod';

export const SerializeSchema = z.object({
  value: z.unknown()
});

export type SerializeDto = z.infer<typeof SerializeSchema>;
