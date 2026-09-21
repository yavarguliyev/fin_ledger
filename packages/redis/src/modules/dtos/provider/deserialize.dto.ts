import { z } from 'zod';

export const DeserializeSchema = z.object({
  raw: z.string({ message: 'Raw value must be a string' })
});

export type DeserializeDto = z.infer<typeof DeserializeSchema>;
