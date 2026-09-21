import { z } from 'zod';

export const ObjectKeySchema = z.object({
  key: z.string({ message: 'Key must be a string' })
});

export type ObjectKeyDto = z.infer<typeof ObjectKeySchema>;
